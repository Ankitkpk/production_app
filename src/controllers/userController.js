import {asyncHandler} from "../utils/asynchandler.js";
import { User } from "../models/userModel.js";
import uploadImageOnCloudinary from '../utils/cloudinary.js';
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessTokenRefereshToken = async(userId)=>{
    try{
     const user = await User.findById(userId);
     const  AccessToken=user.generateAccessToken();
     const  RefereshToken=user.generateRefreshToken();
     user.refreshToken=RefereshToken;
     //this will save documents even if the password is missing// 
     await user.save({ validateBeforeSave: false });
     return { AccessToken , RefereshToken}
    }catch(error)
    {
        return res.status(500).json({ message: "error generating access and refresh token" });
    }
}
  

const registerUser = async (req, res) => {
    try {
        const { username, email, fullName, password } = req.body;

        // Check if any field is empty
        if ([username, email, fullName, password].some((field) => field?.trim() === "")) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const existedUser = await User.findOne({ $or: [{ username }, { email }] });

        if (existedUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        console.log(req.files);

        // Get file paths from multer
        const avatarImage = req.files?.avatar?.[0]?.path || null;
        const coverImage = req.files?.coverImage?.[0]?.path || null;

        if (!avatarImage) {
            return res.status(400).json({ message: "Avatar file is required" });
        }
        if (!coverImage) {
            return res.status(400).json({ message: "Cover file is required" });
        }

        // Upload images to Cloudinary
        const uploadedAvatar = await uploadImageOnCloudinary(avatarImage);
        const uploadedCover = await uploadImageOnCloudinary(coverImage);

        // Create new user
        const newUser = new User({
            username,
            email,
            fullName,
            password, // ⚠️ You should hash the password before saving (bcrypt recommended)
            avatar: uploadedAvatar?.secure_url || null,
            coverImage: uploadedCover?.secure_url || null
        });

        await newUser.save();

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                avatar: newUser.avatar,
                coverImage: newUser.coverImage
            }
        });
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



const loginUser = async (req, res) => {
    try {
      const { email, username, password } = req.body;
  
      // Check if email or username is missing
      if (!username && !email) {
        return res.status(400).json({ message: "Email or username is required" });
      }
  
      // Find user by username or email
      const userExist = await User.findOne({ $or: [{ username }, { email }] });
  
      if (!userExist) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Validate password
      const isPasswordCorrect = await userExist.isPasswordCorrect(password);
      if (!isPasswordCorrect) {
        return res.status(401).json({ message: "Invalid password" });
      }
  
      // Generate access token & refresh token
      const { accessToken, refreshToken } = await generateAccessTokenRefereshToken(userExist._id);
  
    
      userExist.refreshToken = refreshToken;
      await userExist.save();
  
    
      const cookieOptions = {
        httpOnly: true,
        secure:true,
        sameSite: "Strict", 
      };
  
      // Set cookies
      res.cookie("accessToken", accessToken,cookieOptions); 
      res.cookie("refreshToken", refreshToken,cookieOptions)
  
      // Get user details excluding sensitive data
      const loggedInUser = await User.findById(userExist._id).select("-password -refreshToken");
  
      return res.status(200).json({
        message: "Login successful",
        user: loggedInUser,
        accessToken, 
        refreshToken,
      });
  
    } catch (error) {
      console.error("Error logging in user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  

const logoutUser = async (req, res) => {
    try {
        const userId = req.user._id;

        // Remove refresh token from the database
        await User.findByIdAndUpdate(
            userId, 
            { $set: { refreshToken: undefined } }, 
            { new: true }
          );

        // Clear cookies for refresh token and accesstoken
        res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "None" });
        res.clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: "None" });

        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


const verifyRefreshToken = async (req, res, next) => {
  try {
    // Extract refresh token from cookies or request body
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Find user in the database
    const user = await User.findById(decodedToken._id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Ensure the stored refresh token matches the provided one
    if (user.refreshToken !== incomingRefreshToken) {
      return res.status(401).json({ message: "Refresh token does not match" });
    }

    const { accessToken, newrefreshToken } = await generateAccessTokenRefereshToken(user._id);

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    };

    res
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", newrefreshToken, cookieOptions)
      .status(200)
      .json({ message: "Tokens refreshed successfully" });

  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const changeCurrentPassword = async (req, res) => {
  try {
    const { oldpassword, newpassword } = req.body;

    // Find user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if old password is correct
    const isPasswordCorrect = await user.isPasswordCorrect(oldpassword);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid old password" });
    }

    user.password = newpassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select("-password");

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(currentUser);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const updateAvatar = async (req, res) => {
  try {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
      return res.status(400).json({ message: "No avatar file provided" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const uploadedAvatar = await uploadImageOnCloudinary(avatarLocalPath);

    // Ensure Cloudinary response is valid
    if (!uploadedAvatar || !uploadedAvatar.secure_url) {
      return res.status(500).json({ message: "Failed to upload avatar" });
    }

    user.avatar = uploadedAvatar.secure_url;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ message: "Avatar updated successfully", avatar: user.avatar });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const getChannelProfile=async(req,res)=>{
   try{
   const {username}=req.params;
   if(!username){

   }
   //aggregation function always return arrays//
   const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions", 
        localField: "_id",
        foreignField: "subscriber", 
        as: "Subscribers"
      }
    },{
      $lookup: {
        from: "subscriptions", 
        localField: "_id",
        foreignField: "channel", 
        as: "channelsubscribed"
      }
    },
    {
      //count
      $addFields: {
        subscriberscount: {
          $size:"$Subscribers"
        },
        channelsubscribedcount:{
         $size:"$channelsubscribed"
        },
        //boolean field to check if its issubscribed  or not //
        isSusbcribed:{
          $cond:{
             if:{$in:[req.user?._id , "$Subscribers.subscriber"]},
             then:true,
             else:false

          }
        }
      }
    },{
       $project:{
        fullName:1,
        avatar:1,
        coverImage:1,
        subscriberscount:1,
        channelsubscribedcount:1,
        isSusbcribed
       }
    }
  ]);
  if (!channel.length) {
    return res.status(404).json({ error: "Channel not found" });
  }
  res.status(200).json(channel[0]);
   }catch(error)
   {
    console.error(error);
    res.status(500).json({ error: "Server error" });
   }
}

const getWatchHistory = async (req, res) => {
  try {
    const history = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "_id",
          foreignField: "watchHistory",
          as: "watchHistory",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
              },
            },
            {
              $addFields: {
                owner: { $first: "$owner" }, 
              },
            },
            {
              $project: {
                owner: {
                  fullName: 1,
                  username: 1,
                  avatar: 1,
                },
              },
            },
          ],
        },
      },
    ]);
  console.log(history);
    return res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error("Error fetching watch history:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};



export {registerUser,loginUser,logoutUser,verifyRefreshToken,changeCurrentPassword,getCurrentUser,updateAvatar,getChannelProfile,getWatchHistory}
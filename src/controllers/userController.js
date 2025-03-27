import {asyncHandler} from "../utils/asynchandler.js";
import { User } from "../models/userModel.js";
import uploadImageOnCloudinary from '../utils/cloudinary.js';
import jwt from "jsonwebtoken";

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


const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateAccessTokenRefereshToken } = require("../utils/tokenUtils");

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



 



export {registerUser,loginUser,logoutUser,verifyRefreshToken}
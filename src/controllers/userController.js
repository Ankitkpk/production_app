import {asyncHandler} from "../utils/asynchandler.js";
import { User } from "../models/userModel.js";
import uploadImageOnCloudinary from '../utils/cloudinary.js';

const registerUser = asyncHandler(async (req, res) => {
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
});

const loginUser=asyncHandler(async (req, res) => {
    const {email, username, password}=req.body;

    if(!username || !email){
        return res.status(400).json({ message: "email and password required" });   
    }
   const userExist = await User.findOne({ $or: [{ username }, { email }]});
   if(!userExist){
    return res.status(400).json({ message: "cannot find user with thses email and password" });
   }
//take email and password from req.body//
//get the user based on email//
//compare password between them//
//verify the token//
//give the access//
//store in cookie//
 
})



export {registerUser,loginUser}
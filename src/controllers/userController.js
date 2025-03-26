import {asyncHandler} from "../utils/asynchandler.js";
import { User } from "../models/userModel.js";
import uploadImageOnCloudinar from '../utils/cloudinary.js';

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullName, password } = req.body;

    // Check if any field is empty
    if ([username, email, fullName, password].some((field) => field?.trim() === "")) {
        return res.status(400).json({ message: "All fields are required" });
    }


    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    // Log uploaded files
    console.log(req.files);

    // Get file paths from multer
    const avatarImage = req.files?.avatar?.[0]?.path || null;
    const coverImage = req.files?.coverImage?.[0]?.path || null;
     if(!avatarImage){
      return res.status(400).json({ message: "avatar file is required" });
     }
     if(!coverImage){
      return res.status(400).json({ message: "cover file is required" });
     }
    const uploadedAvatar = await uploadImageOnCloudinary(avatarImage);
    const uploadedCover =  await uploadImageOnCloudinary(coverImage);

    // Create a new user
    const newUser = new User({
        username,
        email,
        fullName,
        password,
        avatar: uploadedAvatar?.secure_url || null,
        coverImage: uploadedCover?.secure_url || null
    });

    await newUser.save();

    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            avatar: newUser.avatar,
            coverImage: newUser.coverImage
        }
    });
});






export {registerUser}
import jwt from "jsonwebtoken";
import  User  from "../models/userModel";
export const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

      const decodedToken =jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
          const user= await User.findOne(decodedToken._id).select("-password -refreshToken");
          if(!user){
            return res.status(401).json({ message: "invalid access token" });
          }
          req.user=user;
          next();
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

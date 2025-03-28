import express from 'express';
import { loginUser, logoutUser, registerUser,verifyRefreshToken,changeCurrentPassword, getCurrentUser,updateAvatar,getWatchHistory,getChannelProfile } from '../controllers/userController.js';
import {upload} from '../middlewares/multer.js'; 
import { verifyJWT } from '../middlewares/auth.js';


const router = express.Router();  
router.post(
    "/register",
     upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]), 
    registerUser
);
router.route('/login').post(loginUser);
//secure routes//
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refresh-token").post(verifyRefreshToken);
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
router.route("/getCurrentUser").get(verifyJWT,getCurrentUser);
router.route("/updateAvatar").patch(
    verifyJWT,
    upload.single("avatar"), 
    updateAvatar
);
router.route("/getChannelProfile/:username").get(verifyJWT,getChannelProfile);
router.route("/getCurrentUser").get(verifyJWT,getCurrentUser);
router.route("/getWatchHistory").get(verifyJWT,getWatchHistory);
export default router;

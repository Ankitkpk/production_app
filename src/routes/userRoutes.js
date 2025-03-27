import express from 'express';
import { loginUser, logoutUser, registerUser,verifyRefreshToken  } from '../controllers/userController.js';
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
router.route("/refresh-token",verifyRefreshToken);
export default router;

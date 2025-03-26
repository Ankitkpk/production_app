import express from 'express';
import { logoutUser, registerUser } from '../controllers/userController.js';
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
router.route("/logout").post(verifyJWT,logoutUser);
export default router;

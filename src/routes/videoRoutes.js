import express from 'express';
import {createVideo} from '../controllers/videoController.js';
import {upload} from '../middlewares/multer.js'; 



const router = express.Router();  
router.post(
    "/createVideo",
     upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]), 
    createVideo
);
export default router;

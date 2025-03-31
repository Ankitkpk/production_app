import express from 'express';
import {createTweet} from '../controllers/tweetController.js';
import { verifyJWT } from '../middlewares/auth.js';
 



const router = express.Router();  
router.post('/createTweet',verifyJWT,createTweet);
export default router;

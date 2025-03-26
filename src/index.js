 import dotenv from 'dotenv';
import connectDB from './db/index.js';
import cors from 'cors';
import express from "express";
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes.js'
const app = express();
app.use(express.json());

dotenv.config({path:'./.env'});
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"));
app.use(cookieParser());
app.use( '/api/v1/users', userRoutes)
connectDB()
.then(()=>{
    app.listen( process.env.PORT || 8000,()=>{
        console.log(`The server is running on port ${process.env.PORT || 8000}`);
    });
})
.catch((err)=>{
console.log("mongo db failed connection",err);
});
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import express from "express";
const app = express();
app.use(express.json());


const connectDB = async () => {
    try {
        const conn = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`Connected to the database: ${conn.connection.host}/${conn.connection.name}`);
    } catch (error) {
        console.error("Database Connection Error:", error);
        process.exit(1);
    }
};


export default connectDB;
/*What is asyncHandler?
asyncHandler is a higher-order function.
A higher-order function is a function that takes another function as an argument and possibly returns a new function.

Why is asyncHandler needed?
In Express.js, if an asynchronous function throws an error, you need to explicitly pass that error to the next function for the Express error-handling middleware to catch it. Without this, your server might crash or not handle the error properly.*/
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

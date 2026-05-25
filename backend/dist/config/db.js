import mongoose from "mongoose";
import { logger } from "../utils/logger.js";
import dotenv from "dotenv";
dotenv.config();
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/veda-ai";
export const connectDB = async () => {
    try {
        mongoose.set("strictQuery", true);
        await mongoose.connect(MONGO_URI);
        logger.info("MongoDB connected successfully");
    }
    catch (error) {
        logger.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};

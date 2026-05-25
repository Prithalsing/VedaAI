import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { logger } from "../utils/logger.js";
dotenv.config();
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey === "your_gemini_api_key_here") {
    logger.warn("GEMINI_API_KEY is not configured or using default placeholder. AI generation requests will fail.");
}
export const ai = new GoogleGenAI({
    apiKey: apiKey || "",
});

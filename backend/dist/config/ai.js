import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { logger } from "../utils/logger.js";
dotenv.config();
const apiKey = process.env.GEMINI_API_KEY;
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
export const isGeminiConfigured = Boolean(apiKey) &&
    apiKey !== "your_gemini_api_key_here";
if (!isGeminiConfigured) {
    logger.warn("GEMINI_API_KEY is not configured or is using the placeholder value. AI generation will use mock fallback output.");
}
else {
    logger.info(`Gemini AI configured with model '${geminiModel}'.`);
}
export const ai = new GoogleGenAI({
    apiKey: apiKey || "",
});
export const geminiConfig = {
    model: geminiModel,
};

import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const isGeminiConfigured = Boolean(
  apiKey &&
    apiKey !== "your-gemini-api-key-here" &&
    apiKey.trim().length > 0
);

let genAIInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  if (!isGeminiConfigured) {
    return null;
  }
  if (!genAIInstance) {
    genAIInstance = new GoogleGenAI({ apiKey: apiKey! });
  }
  return genAIInstance;
}

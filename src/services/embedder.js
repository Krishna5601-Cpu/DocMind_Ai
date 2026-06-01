import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function createEmbedding(text) {
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001", // Utilizing the verified global free tier endpoint
      contents: text,
    });

    // SAFELY TRY BOTH RESPONSE FORMATS:
    // If the SDK returns an array structure under .embeddings:
    if (response.embeddings && response.embeddings[0]) {
      return response.embeddings[0].values;
    }

    // If the SDK returns a singular property structure under .embedding:
    if (response.embedding) {
      return response.embedding.values;
    }

    throw new Error("Unexpected embedding response structure format");
  } catch (error) {
    console.error("❌ Failed inside embedContent routine:", error);
    throw error;
  }
}

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Helper utility to pause execution
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function generateAnswer(
  question,
  context,
  history,
  retries = 3,
  delayMs = 5000,
) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", // Updated to gemini-2.5-flash
        contents: [
          ...history,
          {
            role: "user",
            parts: [{ text: question }],
          },
        ],
        config: {
          systemInstruction: `
You are a Data Structures and Algorithms expert.

Answer ONLY using the provided context.

If the answer is unavailable in context, say:
"I could not find the answer in the document."

CONTEXT:
${context}
          `,
        },
      });

      return response.text;
    } catch (error) {
      // Check if it's a Rate Limit / Quota error
      const isRateLimit =
        error.status === 429 ||
        JSON.stringify(error).includes("429") ||
        JSON.stringify(error).includes("quota");

      if (isRateLimit && attempt < retries) {
        console.warn(
          `⚠️ Rate limit hit during answer generation. Retrying attempt ${attempt}/${retries} in ${delayMs / 1000}s...`,
        );
        await delay(delayMs);
        delayMs *= 2; // Exponential backoff scaling
        continue;
      }

      throw error;
    }
  }
}

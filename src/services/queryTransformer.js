import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function transformQuery(
  question,
  history = [],
  retries = 3,
  delayMs = 4000,
) {
  // If history is empty, don't waste API tokens rewriting it
  if (history.length === 0) {
    return question;
  }

  const formattedHistory = history.map((msg) => ({
    role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
    parts: typeof msg.parts === "string" ? [{ text: msg.parts }] : msg.parts,
  }));

  const contents = [
    ...formattedHistory,
    {
      role: "user",
      parts: [{ text: question }],
    },
  ];

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", // Updated to gemini-2.5-flash
        contents: contents,
        config: {
          systemInstruction: `You are a query rewriting expert. Convert follow-up questions into complete standalone questions. Only return the rewritten question. Do not include markdown code blocks, just the raw text.`,
          temperature: 0.1,
        },
      });

      return response.text?.trim() || question;
    } catch (error) {
      const isRateLimit =
        error.status === 429 ||
        JSON.stringify(error).includes("429") ||
        JSON.stringify(error).includes("quota");

      if (isRateLimit && attempt < retries) {
        console.warn(
          `⚠️ Rate limit hit during query rewrite. Retrying attempt ${attempt}/${retries} in ${delayMs / 1000}s...`,
        );
        await delay(delayMs);
        delayMs *= 2;
        continue;
      }

      console.error(
        "❌ Gemini Rewrite Engine failed completely:",
        error.message || error,
      );
      return question; // Fall back to original user input on complete failure
    }
  }
  return question;
}

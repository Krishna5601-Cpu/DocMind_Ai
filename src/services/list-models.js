import { GoogleGenAI } from "@google/genai";
import "dotenv/config"; 

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function checkModels() {
  try {
    console.log("Fetching available models for your API key...\n");

    // Call the ModelService to list available models
    const response = await ai.models.list();

    console.log("--- AVAILABLE EMBEDDING MODELS ---");
    
    // The SDK returns a paginated iterator object. 
    // We use a regular for...of or for await...of loop directly on the response.
    for (const model of response) {
      if (model.supportedGenerationMethods?.includes("embedContent")) {
        console.log(`✅ Model Identifier: "${model.name}" (${model.displayName})`);
      }
    }
    
  } catch (error) {
    console.error("❌ Failed to list models:", error);
  }
}

checkModels();
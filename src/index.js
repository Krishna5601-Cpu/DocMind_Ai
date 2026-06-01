import "dotenv/config";
import readlineSync from "readline-sync";
import { transformQuery } from "./services/queryTransformer.js";
import { retrieveDocs } from "./services/retriever.js";
import { generateAnswer } from "./services/chat.js";

const history = [];

async function startChat() {
  console.log("\n🤖 RAG Chatbot Started");
  console.log("Type 'exit' to stop.\n");

  while (true) {
    const question = readlineSync.question("Ask Question: ");

    if (!question || question.trim() === "") {
      continue;
    }

    if (question.toLowerCase() === "exit") {
      console.log("👋 Goodbye!");
      break;
    }

    try {
      console.log("\n🔄 Rewriting query...");
      const standaloneQuestion = await transformQuery(question, history);

      console.log("🔍 Retrieving documents...");
      const context = await retrieveDocs(standaloneQuestion);

      console.log("🧠 Generating answer...\n");
      const answer = await generateAnswer(standaloneQuestion, context, history);

      console.log(`🤖 Answer: ${answer}\n`);

      // Only save history if the interactions succeeded completely
      history.push({
        role: "user",
        parts: [{ text: question }],
      });

      history.push({
        role: "model",
        parts: [{ text: answer }],
      });
    } catch (error) {
      console.error("\n❌ Error handling request:", error.message || error);
      console.log(
        "⚠️ Let's try another question or try again in a few seconds.\n",
      );
    }
  }
}

startChat();

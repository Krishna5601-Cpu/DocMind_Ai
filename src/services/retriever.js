import { createEmbedding } from "./embedder.js";

import { pineconeIndex } from "../config/pinecone.js";

export async function retrieveDocs(question) {
  const queryVector = await createEmbedding(question);

  const searchResults = await pineconeIndex.query({
    topK: 5,
    vector: queryVector,
    includeMetadata: true,
  });

  const context = searchResults.matches
    .map((match) => match.metadata.text)
    .join("\n\n---\n\n");

  return context;
}

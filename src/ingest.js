import "dotenv/config";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

import { splitter } from "./utils/splitter.js";

import { createEmbedding } from "./services/embedder.js";

import { pineconeIndex } from "./config/pinecone.js";

async function ingestPDF() {
  try {
    console.log("📄 Loading PDF...");

    const loader = new PDFLoader("./data/dsa.pdf");

    const docs = await loader.load();

    console.log("✂️ Splitting text...");

    const splitDocs = await splitter.splitDocuments(docs);

    console.log(`✅ Total chunks: ${splitDocs.length}`);

    console.log("🚀 Creating embeddings...");

    const vectors = [];

    for (let i = 0; i < splitDocs.length; i++) {
      const text = splitDocs[i].pageContent;

      const embedding = await createEmbedding(text);

      vectors.push({
        id: `doc-${i}`,
        values: embedding,
        metadata: {
          text,
        },
      });

      console.log(`✅ Embedded chunk ${i + 1}`);
    }

    console.log("🚀 Uploading to Pinecone in safe batches...");

    // Define a batch size that keeps the request size well under 2MB
    const BATCH_SIZE = 50;

    for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
      const batch = vectors.slice(i, i + BATCH_SIZE);
      const currentBatchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(vectors.length / BATCH_SIZE);

      console.log(`Sending batch ${currentBatchNum} of ${totalBatches}...`);

      await pineconeIndex.upsert(batch);
    }

    console.log("🎉 PDF Indexed Successfully!");
  } catch (error) {
    console.error("❌ Error during ingestion:", error);
  }
}

ingestPDF();

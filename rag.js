import axios from "axios";
import { ChromaClient } from "chromadb";

const client = new ChromaClient({ host: "localhost", port: 8000 });
let collection;

async function initCollection() {
  try {
    collection = await client.getCollection({ name: "rag_docs" });
  } catch (err) {
    console.error("⚠️  Collection not found. Make sure to run injest.js first.");
    throw err;
  }
}

async function getEmbedding(text) {
  const res = await axios.post("http://localhost:11434/api/embeddings", {
    model: "nomic-embed-text",
    prompt: text
  });
  return res.data.embedding;
}

export async function searchDocs(question) {
  if (!collection) {
    await initCollection();
  }

  const qEmbed = await getEmbedding(question);

  const results = await collection.query({
    queryEmbeddings: [qEmbed],
    nResults: 3
  });

  return results.documents[0].join("\n");
}

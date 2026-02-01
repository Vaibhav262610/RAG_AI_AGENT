import fs from "fs";
import axios from "axios";
import { ChromaClient } from "chromadb";

const client = new ChromaClient({
  host: "localhost",
  port: 8000,
});

const collection = await client.getOrCreateCollection({
  name: "my_knowledge",
  embeddingFunction: null,
});

const text = fs.readFileSync("./data/university_rules.txt", "utf-8");
const chunks = text.match(/.{1,300}/g);

for (let i = 0; i < chunks.length; i++) {
    const embeddingRes = await axios.post(
        "http://localhost:11434/api/embeddings",
        {
          model: "nomic-embed-text",
          prompt: chunks[i],
        }
      );      

  await collection.add({
    ids: [`doc-${i}`],
    documents: [chunks[i]],
    embeddings: [embeddingRes.data.embedding],
  });
}

console.log("✅ Data ingested successfully");

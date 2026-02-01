import fs from "fs";
import axios from "axios";
import { ChromaClient } from "chromadb";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse"); // ✅ correct way in ESM

const client = new ChromaClient({ path: "./db" });
const collection = await client.getOrCreateCollection({ name: "docs" });

async function getEmbedding(text) {
  const res = await axios.post("http://localhost:11434/api/embeddings", {
    model: "nomic-embed-text",
    prompt: text
  });
  return res.data.embedding;
}

async function ingest() {
  const files = fs.readdirSync("./data");

  for (const file of files) {
    let text = "";

    if (file.endsWith(".txt")) {
      text = fs.readFileSync(`./data/${file}`, "utf-8");
    }

    if (file.endsWith(".pdf")) {
      const buffer = fs.readFileSync(`./data/${file}`);
      const data = await pdfParse(buffer);
      text = data.text;
    }

    const chunks = text.match(/(.|[\r\n]){1,800}/g);

    for (let i = 0; i < chunks.length; i++) {
      const emb = await getEmbedding(chunks[i]);

      await collection.add({
        ids: [`${file}-${i}`],
        documents: [chunks[i]],
        embeddings: [emb]
      });
    }

    console.log("✅ Ingested:", file);
  }

  console.log("🔥 All documents stored in ChromaDB");
}

await ingest();

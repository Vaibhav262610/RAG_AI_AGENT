import { ChromaClient } from "chromadb";

const client = new ChromaClient({
  host: "localhost",
  port: 8000,
});

await client.deleteCollection({ name: "my_knowledge" });
console.log("🗑️ Collection deleted successfully");

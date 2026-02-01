import { ChromaClient } from "chromadb";
import { Ollama } from "ollama";

const ollama = new Ollama({ host: "http://localhost:11434" });

async function main() {
  const client = new ChromaClient({
    host: "localhost",
    port: 8000,
    ssl: false,
  });

  const getCollection = await client.getCollection({
        name: "vaibhav_docs",
    });

    // get everything (small collections only)
    const all = await getCollection.get();

    console.log("this is the data inside chromadb",all);

  const collection = await client.getOrCreateCollection({
    name: "vaibhav_docs",
    embeddingFunction: {
      generate: async (texts) => {
        const embeddings = [];
        for (const text of texts) {
          const res = await ollama.embeddings({
            model: "nomic-embed-text",
            prompt: text,
          });
          embeddings.push(res.embedding);
        }
        return embeddings;
      },
    },
  });

  await collection.add({
    ids: ["1"],
    documents: ["Hello my name is vaibhav"],
  });

  const result = await collection.query({
    queryTexts: ["Docker"],
    nResults: 1,
  });

  console.log(result);
}



main();

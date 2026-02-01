import axios from "axios";
import { ChromaClient } from "chromadb";

/* ---------------- CONFIG ---------------- */
const OLLAMA_BASE = "http://localhost:11434";
const LLM_MODEL = "llama3.1";
const EMBED_MODEL = "nomic-embed-text";
/* ---------------------------------------- */

/* -------- SAFE OLLAMA PARSER -------- */
function extractText(res) {
  return (
    res?.data?.response ||
    res?.data?.message?.content ||
    ""
  ).trim();
}

/* -------------- CHROMA -------------- */
const client = new ChromaClient({
  host: "localhost",
  port: 8000,
});

const collection = await client.getCollection({
  name: "my_knowledge",
  embeddingFunction: null,
});

/* -------------- AGENT STEPS -------------- */

// 1️⃣ THINK
async function think(question) {
  const res = await axios.post(`${OLLAMA_BASE}/api/generate`, {
    model: LLM_MODEL,
    prompt: `
Rewrite the question as a short search query.

Question:
${question}

Search query:
`,
    stream: false,
  });

  return extractText(res);
}

// 2️⃣ RETRIEVE
async function retrieve(intent) {
  const embedRes = await axios.post(`${OLLAMA_BASE}/api/embeddings`, {
    model: EMBED_MODEL,
    prompt: intent,
  });

  const results = await collection.query({
    nResults: 3,
    queryEmbeddings: [embedRes.data.embedding],
  });

  return results.documents.flat().join("\n");
}

// 3️⃣ ANSWER
async function answer(question, context) {
  const res = await axios.post(`${OLLAMA_BASE}/api/generate`, {
    model: LLM_MODEL,
    prompt: `
Answer using ONLY the context.
If not found, say "I don't know".

Context:
${context}

Question:
${question}
`,
    stream: false,
  });

  return extractText(res);
}

// 4️⃣ SAFE REFLECTION (NO LLM LOOP)
function reflect(answer, context) {
  if (!answer) return false;
  if (answer.toLowerCase().includes("i don't know")) return false;
  if (context.length < 20) return false;
  return true;
}

/* -------------- RUN AGENT -------------- */
export async function runAgent(question) {
  console.log("🧠 THINKING...");
  const intent = await think(question);
  console.log("Intent:", intent);

  console.log("\n📚 RETRIEVING...");
  const context = await retrieve(intent);

  console.log("\n✍️ ANSWERING...");
  const response = await answer(question, context);

  console.log("\n🔍 REFLECTING...");
  const ok = reflect(response, context);

  if (!ok) {
    return "I don't have enough information to answer that confidently.";
  }

  return response;
}

/* -------------- START -------------- */
const userQuestion = "What is University head name ";

const finalAnswer = await runAgent(userQuestion);

console.log("\n🤖 FINAL ANSWER:\n", finalAnswer);

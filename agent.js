import axios from "axios";
import readline from "readline";

import { addToMemory, getMemoryPrompt } from "./memory.js";
import { getTime, readTxt } from "./tools.js";
import { searchDocs } from "./rag.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("🤖 AI Agent Ready (memory + tools + RAG)\nType 'exit' to quit");

async function askLLM(prompt) {
  const res = await axios.post("http://localhost:11434/api/generate", {
    model: "llama3.1",
    prompt,
    stream: false
  });
  return res.data.response.trim();
}

async function runAgent(userInput) {
  // 🧠 store user msg
  addToMemory("user", userInput);

  const memory = getMemoryPrompt();

  // 📚 RAG search
  const docContext = await searchDocs(userInput);

  // 🧠 TOOL DECISION PROMPT
  const toolPrompt = `
You are an AI agent with memory, document access and tools.

Relevant document info:
${docContext}

TOOLS:
1. get_time
2. read_txt(path)

If tool is required, reply EXACTLY in format:
TOOL: tool_name | argument

If not, answer normally.

Conversation:
${memory}

USER: ${userInput}
ASSISTANT:
`;

  let reply = await askLLM(toolPrompt);

  console.log("\n🤖 Raw:", reply);

  // 🛠 TOOL HANDLING
  if (reply.startsWith("TOOL:")) {
    const [, toolLine] = reply.split("TOOL:");
    const [toolName, arg] = toolLine.split("|").map(s => s.trim());

    let toolResult = "";

    if (toolName === "get_time") {
      toolResult = getTime();
    }

    else if (toolName === "read_txt") {
      toolResult = readTxt(arg);
    }

    // 🔁 SEND TOOL RESULT BACK TO LLM
    const finalPrompt = `
You used a tool and got this result:

${toolResult}

Now answer the user's original question:

QUESTION: ${userInput}

Give a clear and helpful answer using this data.
`;

    reply = await askLLM(finalPrompt);
  }

  // 🧠 store assistant msg
  addToMemory("assistant", reply);

  console.log("\n🤖 Agent:", reply);
}

function chat() {
  rl.question("\n🧑 You: ", async (input) => {
    if (input.toLowerCase() === "exit") {
      rl.close();
      return;
    }

    try {
      await runAgent(input);
    } catch (err) {
      console.error("❌ Error:", err.message);
    }

    chat();
  });
}

chat();
 
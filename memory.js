import fs from "fs";

const MEMORY_FILE = "./memory.json";

// Load memory when app starts
function loadMemory() {
  if (!fs.existsSync(MEMORY_FILE)) {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify([], null, 2));
    return [];
  }

  const data = fs.readFileSync(MEMORY_FILE, "utf-8");
  return JSON.parse(data);
}

let memory = loadMemory();

// Save memory to file
function saveMemory() {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

export function addToMemory(role, content) {
  memory.push({ role, content, time: new Date().toISOString() });

  // optional: limit size
  if (memory.length > 50) memory.shift();

  saveMemory();
}

export function getMemoryPrompt() {
  return memory
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");
}

export function getRawMemory() {
  return memory;
}

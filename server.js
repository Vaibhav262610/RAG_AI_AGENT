import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { runAgent } from "./agent.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// serve phone UI
app.use(express.static(path.join(__dirname, "public")));

// API for agent
app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question required" });
    }

    const answer = await runAgent(question);
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Agent error" });
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log("✅ Server running on port 3000");
});

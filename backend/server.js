const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Groq = require("groq-sdk");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Groq setup
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ✅ AI route
app.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a DSA tutor. Explain A*, BFS, DFS,Dijkstra in simple terms with examples.",
        },
        {
          role: "user",
          content: question,
        },
      ],
      model: "llama-3.3-70b-versatile", // 🔥 best model
    });

    res.json({
      answer: chatCompletion.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error");
  }
});

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
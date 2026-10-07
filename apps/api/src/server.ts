import express from "express";
import cors from "cors";
import { agent } from "./agent/graph";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post("/api/agent", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "message is required",
      });
    }

    const result = await agent.invoke({
      userMessage: message,
    });

    return res.json({
      response: result.response,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Agent execution failed",
    });
  }
});

app.get("/api/health", (req, res) => {
  return res.json({
    message: "The health of this api is very healthy",
  });
});

app.listen(PORT, () => {
  console.log(`AgentForge API running on http://localhost:${PORT}`);
});
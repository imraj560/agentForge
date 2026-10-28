import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { Command } from "@langchain/langgraph";
import { agent } from "./agent/graph";
import "dotenv/config";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post("/api/agent", async (req, res) => {
  try {
    const { message, actionType, proposedAction } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "message is required",
      });
    }

    if (actionType !== undefined && typeof actionType !== "string") {
      return res.status(400).json({
        error: "actionType must be a string",
      });
    }

    if (
      (actionType === undefined) !== (proposedAction === undefined)
    ) {
      return res.status(400).json({
        error: "actionType and proposedAction must be provided together",
      });
    }

    if (
      proposedAction !== undefined &&
      (typeof proposedAction !== "string" ||
        proposedAction.trim().length === 0)
    ) {
      return res.status(400).json({
        error: "proposedAction must be a non-empty string",
      });
    }

    // Each investigation gets its own resumable thread.
    const threadId = randomUUID();

    const result = await agent.invoke(
      {
        userMessage: message,
        messages: [],
        actionType,
        proposedAction,
      },
      {
        configurable: {
          thread_id: threadId,
        },
      }
    );

    const interruptInfo = (
      result as typeof result & {
        __interrupt__?: Array<{ value: unknown }>;
      }
    ).__interrupt__;

    if (interruptInfo?.length) {
      return res.status(202).json({
        status: "approval_required",
        threadId,
        response: result.response,
        approvalRequest: interruptInfo[0].value,
      });
    }

    return res.json({
      status: "completed",
      threadId,
      response: result.response,
      approvalStatus: result.approvalStatus,
      actionResult: result.actionResult,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Agent execution failed",
    });
  }
});


// Resume an investigation after the human makes a decision.
app.post("/api/agent/approval", async (req, res) => {
  try {
    const { threadId, approved } = req.body;

    if (
      typeof threadId !== "string" ||
      threadId.trim().length === 0
    ) {
      return res.status(400).json({
        error: "threadId is required",
      });
    }

    if (typeof approved !== "boolean") {
      return res.status(400).json({
        error: "approved must be a boolean",
      });
    }

    const result = await agent.invoke(
      new Command({
        resume: { approved },
      }),
      {
        configurable: {
          thread_id: threadId,
        },
      }
    );

    return res.json({
      status: "completed",
      threadId,
      response: result.response,
      approvalStatus: result.approvalStatus,
      actionResult: result.actionResult,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to process approval decision",
    });
  }
});

app.get("/api/health", (_req, res) => {
  return res.json({
    message: "The health of this api is very healthy",
  });
});

app.listen(PORT, () => {
  console.log(`AgentForge API running on http://localhost:${PORT}`);
});
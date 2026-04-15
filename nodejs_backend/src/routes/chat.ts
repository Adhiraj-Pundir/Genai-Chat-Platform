import { Router, Response } from "express";
import { verifyToken } from "../middleware/verifyToken";
import { AuthenticatedRequest, ChatMessageBody } from "../types";
import { isAgentActive, refreshTimeout } from "../services/agentManager";
import {
  analyzeSentiment,
  runAgent,
  saveMemory,
  loadMemory,
  summarizeChat,
} from "../services/pythonService";
import { sendMessageToChannel } from "../services/streamService";

const router = Router();

router.post(
  "/message",
  verifyToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const { channelId, userId, message } = req.body as ChatMessageBody;

    if (!channelId || !userId || !message) {
      res.status(400).json({
        success: false,
        error: "channelId, userId, and message are required",
      });
      return;
    }

    // 1. Analyze sentiment
    let sentimentResult = { sentiment: "neutral", emoji: "😐", polarity: 0 };
    try {
      sentimentResult = await analyzeSentiment(message);
    } catch (err) {
      console.error("[chat] sentiment failed:", err);
    }

    // 2. If agent is active, get AI response
    if (isAgentActive(channelId)) {
      refreshTimeout(channelId);

      try {
        const agentResult = await runAgent(userId, channelId, message);
        console.log("[chat] agent reply:", agentResult.reply.slice(0, 80));

        // Send AI reply through Stream
        await sendMessageToChannel(channelId, "ai-assistant", agentResult.reply);

        // Save to Firebase (best-effort)
        saveMemory(channelId, userId, message, agentResult.reply, sentimentResult.sentiment, sentimentResult.emoji)
          .catch((e) => console.error("[chat] saveMemory failed:", e));

        res.json({
          success: true,
          data: { sentiment: sentimentResult, aiReply: agentResult.reply, agentActive: true },
        });
      } catch (err) {
        console.error("[chat] agent/stream error:", err);
        res.status(500).json({ success: false, error: String(err) });
      }
      return;
    }

    res.json({
      success: true,
      data: { sentiment: sentimentResult, agentActive: false },
    });
  }
);

router.post("/summarize", verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  const { channelId, messages } = req.body as {
    channelId: string;
    messages: Array<{ user: string; text: string }>;
  };

  if (!channelId || !messages) {
    res.status(400).json({ success: false, error: "channelId and messages required" });
    return;
  }

  const result = await summarizeChat(messages, channelId);

  res.json({ success: true, data: result });
});

export default router;

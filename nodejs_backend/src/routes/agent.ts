import { Router, Response } from "express";
import { verifyToken } from "../middleware/verifyToken";
import {
  startAgent,
  stopAgent,
  isAgentActive,
  getAgentInfo,
} from "../services/agentManager";
import { AuthenticatedRequest, AgentStartBody, AgentStopBody } from "../types";

const router = Router();

router.post(
  "/start",
  verifyToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const { channelId, userId } = req.body as AgentStartBody;

    if (!channelId || !userId) {
      res.status(400).json({ success: false, error: "channelId and userId required" });
      return;
    }

    startAgent(channelId, userId);

    res.json({
      success: true,
      data: { channelId, status: "active", message: "AI agent started" },
    });
  }
);

router.post(
  "/stop",
  verifyToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const { channelId } = req.body as AgentStopBody;

    if (!channelId) {
      res.status(400).json({ success: false, error: "channelId required" });
      return;
    }

    const stopped = stopAgent(channelId);

    res.json({
      success: true,
      data: {
        channelId,
        status: "inactive",
        message: stopped ? "AI agent stopped" : "Agent was not active",
      },
    });
  }
);

router.get(
  "/status",
  verifyToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const channelId = req.query.channelId as string;

    if (!channelId) {
      res.status(400).json({ success: false, error: "channelId query param required" });
      return;
    }

    const active = isAgentActive(channelId);
    const info = getAgentInfo(channelId);

    res.json({
      success: true,
      data: {
        channelId,
        active,
        createdAt: info?.createdAt ?? null,
      },
    });
  }
);

export default router;

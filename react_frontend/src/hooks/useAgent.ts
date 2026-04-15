import { useState, useCallback } from "react";
import { AgentStatus } from "../types";
import { startAgent, stopAgent, getAgentStatus } from "../utils/api";

export function useAgent(channelId: string, userId: string) {
  const [status, setStatus] = useState<AgentStatus>("inactive");

  const start = useCallback(async () => {
    setStatus("loading");
    try {
      await startAgent(channelId, userId);
      setStatus("active");
    } catch {
      setStatus("inactive");
    }
  }, [channelId, userId]);

  const stop = useCallback(async () => {
    setStatus("loading");
    try {
      await stopAgent(channelId);
      setStatus("inactive");
    } catch {
      setStatus("active");
    }
  }, [channelId]);

  const checkStatus = useCallback(async () => {
    try {
      const res = await getAgentStatus(channelId);
      setStatus(res.data?.active ? "active" : "inactive");
    } catch {
      setStatus("inactive");
    }
  }, [channelId]);

  return { status, start, stop, checkStatus };
}

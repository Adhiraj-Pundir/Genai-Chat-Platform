import { ActiveAgent } from "../types";

const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

const activeAgents = new Map<string, ActiveAgent>();

export function startAgent(channelId: string, userId: string): void {
  if (activeAgents.has(channelId)) {
    refreshTimeout(channelId);
    return;
  }

  const timeoutHandle = setTimeout(() => {
    stopAgent(channelId);
  }, INACTIVITY_TIMEOUT_MS);

  activeAgents.set(channelId, {
    channelId,
    userId,
    createdAt: new Date(),
    timeoutHandle,
  });
}

export function stopAgent(channelId: string): boolean {
  const agent = activeAgents.get(channelId);
  if (!agent) return false;

  clearTimeout(agent.timeoutHandle);
  activeAgents.delete(channelId);
  return true;
}

export function isAgentActive(channelId: string): boolean {
  return activeAgents.has(channelId);
}

export function refreshTimeout(channelId: string): void {
  const agent = activeAgents.get(channelId);
  if (!agent) return;

  clearTimeout(agent.timeoutHandle);
  agent.timeoutHandle = setTimeout(() => {
    stopAgent(channelId);
  }, INACTIVITY_TIMEOUT_MS);
  activeAgents.set(channelId, agent);
}

export function getAgentInfo(channelId: string): ActiveAgent | undefined {
  return activeAgents.get(channelId);
}

export function getAllActiveAgents(): string[] {
  return Array.from(activeAgents.keys());
}

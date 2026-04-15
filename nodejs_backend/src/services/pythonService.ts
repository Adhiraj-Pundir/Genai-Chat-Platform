import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const PYTHON_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:5000";

export async function generateResponse(
  userId: string,
  channelId: string,
  message: string,
  history: Array<{ userMessage: string; aiResponse: string }>
): Promise<{ reply: string; tokensUsed: number }> {
  const { data } = await axios.post(`${PYTHON_URL}/generate`, {
    userId,
    channelId,
    message,
    history,
  });
  return data;
}

export async function analyzeSentiment(
  text: string
): Promise<{ sentiment: string; emoji: string; polarity: number }> {
  const { data } = await axios.post(`${PYTHON_URL}/sentiment`, { text });
  return data;
}

export async function summarizeChat(
  messages: Array<{ user: string; text: string }>,
  channelId: string
): Promise<{ summary: string; originalCount: number; compressionRate: number }> {
  const { data } = await axios.post(`${PYTHON_URL}/summarize`, {
    messages,
    channelId,
  });
  return data;
}

export async function runAgent(
  userId: string,
  channelId: string,
  message: string
): Promise<{ reply: string; userId: string; channelId: string }> {
  const { data } = await axios.post(`${PYTHON_URL}/agent`, {
    userId,
    channelId,
    message,
  });
  return data;
}

export async function saveMemory(
  channelId: string,
  userId: string,
  userMessage: string,
  aiResponse: string,
  sentiment: string,
  emoji: string
): Promise<void> {
  await axios.post(`${PYTHON_URL}/memory/save`, {
    channelId,
    userId,
    userMessage,
    aiResponse,
    sentiment,
    emoji,
  });
}

export async function loadMemory(
  channelId: string,
  userId: string
): Promise<Array<{ userMessage: string; aiResponse: string; sentiment: string; emoji: string; timestamp: string }>> {
  const { data } = await axios.post(`${PYTHON_URL}/memory/load`, {
    channelId,
    userId,
  });
  return data.history;
}

export async function searchWeb(
  query: string
): Promise<{ answer: string; results: unknown[] }> {
  const { data } = await axios.post(`${PYTHON_URL}/search`, { query });
  return data;
}

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

// Attach token automatically when available
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("stream_user");
  if (raw) {
    const user = JSON.parse(raw);
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return config;
});

// Auth
export async function loginUser(username: string, password: string) {
  const { data } = await api.post("/api/auth/login", { username, password });
  return data;
}

export async function registerUser(username: string, password: string) {
  const { data } = await api.post("/api/auth/register", { username, password });
  return data;
}

// Agent
export async function startAgent(channelId: string, userId: string) {
  const { data } = await api.post("/api/agent/start", { channelId, userId });
  return data;
}

export async function stopAgent(channelId: string) {
  const { data } = await api.post("/api/agent/stop", { channelId });
  return data;
}

export async function getAgentStatus(channelId: string) {
  const { data } = await api.get(`/api/agent/status?channelId=${channelId}`);
  return data;
}

// Chat
export async function sendMessage(
  channelId: string,
  userId: string,
  message: string
) {
  const { data } = await api.post("/api/chat/message", {
    channelId,
    userId,
    message,
  });
  return data;
}

export async function summarizeChat(
  channelId: string,
  messages: Array<{ user: string; text: string }>
) {
  const { data } = await api.post("/api/chat/summarize", {
    channelId,
    messages,
  });
  return data;
}

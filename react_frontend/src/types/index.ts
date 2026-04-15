export interface User {
  userId: string;
  username: string;
  token: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface Message {
  id: string;
  text: string;
  user: {
    id: string;
    name: string;
  };
  created_at: string;
  sentiment?: string;
  emoji?: string;
}

export interface Channel {
  id: string;
  name: string;
  unreadCount?: number;
}

export type AgentStatus = "active" | "inactive" | "loading";

export interface SentimentResult {
  sentiment: string;
  emoji: string;
  polarity: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  password: string;
}

export interface SummaryResult {
  summary: string;
  channelId: string;
  originalCount: number;
  compressionRate: number;
}

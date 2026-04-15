import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userName?: string;
}

export interface RegisterBody {
  username: string;
  password: string;
}

export interface LoginBody {
  username: string;
  password: string;
}

export interface AgentStartBody {
  channelId: string;
  userId: string;
}

export interface AgentStopBody {
  channelId: string;
}

export interface ChatMessageBody {
  channelId: string;
  userId: string;
  message: string;
}

export interface SentimentResult {
  sentiment: string;
  emoji: string;
  polarity: number;
}

export interface AgentReply {
  reply: string;
  userId: string;
  channelId: string;
}

export interface ActiveAgent {
  channelId: string;
  userId: string;
  createdAt: Date;
  timeoutHandle: ReturnType<typeof setTimeout>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

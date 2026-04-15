import { useEffect, useRef, useState } from "react";
import {
  Channel,
  MessageList,
  MessageInput,
  Window,
  useChannelActionContext,
  useChannelStateContext,
} from "stream-chat-react";
import { Channel as StreamChannel, StreamChat } from "stream-chat";
import { useAgent } from "../hooks/useAgent";
import { sendMessage } from "../utils/api";
import { SummaryButton } from "./SummaryButton";
import { TypingIndicator } from "./TypingIndicator";
import "stream-chat-react/dist/css/v2/index.css";

interface ChatProps {
  client: StreamChat;
  channel: StreamChannel;
  userId: string;
  channelId: string;
}

function ChatInner({
  userId,
  channelId,
}: {
  userId: string;
  channelId: string;
}) {
  const { sendMessage: streamSend } = useChannelActionContext();
  const { channel } = useChannelStateContext();
  const { status, start, stop } = useAgent(channelId, userId);

  const handleSend = async (message: { text?: string }) => {
    if (!message.text) return;
    // Send through GetStream first
    await streamSend(message);
    // Then notify backend for AI processing + sentiment
    try {
      await sendMessage(channelId, userId, message.text);
    } catch (err) {
      console.error("Backend message processing failed:", err);
    }
  };

  return (
    <Window>
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white shadow-sm">
        <h2 className="font-semibold text-gray-800">#{channelId}</h2>
        <div className="flex items-center gap-2">
          <SummaryButton channel={channel as StreamChannel} channelId={channelId} />
          <button
            onClick={status === "active" ? stop : start}
            disabled={status === "loading"}
            className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
              status === "active"
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
            } disabled:opacity-50`}
          >
            {status === "loading"
              ? "..."
              : status === "active"
              ? "Stop AI"
              : "Start AI"}
          </button>
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              status === "active" ? "bg-green-400" : "bg-gray-400"
            }`}
          />
        </div>
      </div>
      <MessageList />
      <MessageInput overrideSubmitHandler={handleSend} />
    </Window>
  );
}

export function Chat({ client, channel, userId, channelId }: ChatProps) {
  return (
    <div className="flex-1 h-full overflow-hidden">
      <Channel channel={channel}>
        <ChatInner userId={userId} channelId={channelId} />
      </Channel>
    </div>
  );
}

import { useState } from "react";
import { Channel as StreamChannel, StreamChat } from "stream-chat";

const DEFAULT_CHANNELS = ["general", "random", "team-chat", "ai-lab"];

interface SidebarProps {
  client: StreamChat | null;
  activeChannelId: string | null;
  onChannelSelect: (channelId: string) => void;
  userId: string;
}

export function Sidebar({
  client,
  activeChannelId,
  onChannelSelect,
  userId,
}: SidebarProps) {
  const [onlineUsers] = useState<string[]>([userId]);

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-full">
      <div className="px-4 py-4 border-b border-gray-700">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Channels
        </h2>
        <ul className="space-y-0.5">
          {DEFAULT_CHANNELS.map((ch) => (
            <li key={ch}>
              <button
                onClick={() => onChannelSelect(ch)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeChannelId === ch
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                # {ch}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-4 py-4 flex-1">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Online
        </h2>
        <ul className="space-y-1.5">
          {onlineUsers.map((uid) => (
            <li key={uid} className="flex items-center gap-2 text-sm text-gray-300">
              <span className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
              {uid}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

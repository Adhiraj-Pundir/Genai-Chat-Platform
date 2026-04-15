import { formatTimestamp, generateAvatarColor, getInitials } from "../utils/helpers";

interface MessageBubbleProps {
  text: string;
  username: string;
  userId: string;
  createdAt: string;
  isOwn: boolean;
  isAI?: boolean;
  sentiment?: string;
  emoji?: string;
}

export function MessageBubble({
  text,
  username,
  createdAt,
  isOwn,
  isAI = false,
  emoji,
}: MessageBubbleProps) {
  const avatarColor = generateAvatarColor(username);
  const initials = getInitials(username);

  if (isAI) {
    return (
      <div className="flex items-start gap-2 my-1 px-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: "#6366f1" }}
        >
          AI
        </div>
        <div className="max-w-[75%]">
          <p className="text-xs text-indigo-500 font-semibold mb-0.5">
            Claude (AI Assistant)
          </p>
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl rounded-tl-none px-4 py-2.5">
            <p className="text-gray-800 text-sm leading-relaxed">{text}</p>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 ml-1">
            {formatTimestamp(createdAt)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-2 my-1 px-2 ${
        isOwn ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        style={{ backgroundColor: avatarColor }}
      >
        {initials}
      </div>
      <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        <p className={`text-xs text-gray-500 font-medium mb-0.5 ${isOwn ? "text-right" : ""}`}>
          {username}
        </p>
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isOwn
              ? "bg-indigo-600 text-white rounded-tr-none"
              : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
          }`}
        >
          <p className="text-sm leading-relaxed">
            {text}
            {emoji && <span className="ml-2">{emoji}</span>}
          </p>
        </div>
        <p className={`text-xs text-gray-400 mt-0.5 ${isOwn ? "mr-1 text-right" : "ml-1"}`}>
          {formatTimestamp(createdAt)}
        </p>
      </div>
    </div>
  );
}

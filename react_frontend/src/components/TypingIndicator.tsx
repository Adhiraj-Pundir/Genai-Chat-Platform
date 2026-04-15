export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-2 text-gray-500 text-sm">
      <span>AI is typing</span>
      <span className="flex gap-0.5 ml-1">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </span>
    </div>
  );
}

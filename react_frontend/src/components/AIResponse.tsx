interface AIResponseProps {
  text: string;
  loading?: boolean;
}

export function AIResponse({ text, loading = false }: AIResponseProps) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-indigo-50 border-l-4 border-indigo-400 rounded-r-lg my-1">
      <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
        AI
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-indigo-600 mb-0.5">
          Claude (AI Assistant)
        </p>
        {loading ? (
          <div className="flex gap-1 mt-1">
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        ) : (
          <p className="text-gray-800 text-sm leading-relaxed">{text}</p>
        )}
      </div>
    </div>
  );
}

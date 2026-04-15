import { useState } from "react";
import { summarizeChat } from "../utils/api";
import { SummaryResult } from "../types";
import { Channel as StreamChannel } from "stream-chat";

interface SummaryButtonProps {
  channel: StreamChannel | null;
  channelId: string;
}

export function SummaryButton({ channel, channelId }: SummaryButtonProps) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [open, setOpen] = useState(false);

  const handleSummarize = async () => {
    if (!channel) return;
    setLoading(true);
    try {
      const state = channel.state;
      const messages = Object.values(state.messages).map((m) => ({
        user: m.user?.name || m.user?.id || "Unknown",
        text: m.text || "",
      }));

      const res = await summarizeChat(channelId, messages);
      if (res.success && res.data) {
        setSummary(res.data as SummaryResult);
        setOpen(true);
      }
    } catch (err) {
      console.error("Summarize failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleSummarize}
        disabled={loading || !channel}
        className="flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 text-sm px-3 py-1.5 rounded-lg transition-colors shadow-sm"
      >
        {loading ? (
          "Summarizing..."
        ) : (
          <>
            <span>Summarize Chat</span>
          </>
        )}
      </button>

      {open && summary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Chat Summary</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">{summary.summary}</p>
            <div className="flex gap-4 text-xs text-gray-500">
              <span>{summary.originalCount} messages analyzed</span>
              <span>{Math.round(summary.compressionRate * 100)}% compression</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Chat as StreamChatProvider } from "stream-chat-react";
import { useAuth } from "../hooks/useAuth";
import { useStream } from "../hooks/useStream";
import { Sidebar } from "../components/Sidebar";
import { Chat } from "../components/Chat";
import { Navbar } from "../components/Navbar";
import "stream-chat-react/dist/css/v2/index.css";

const DEFAULT_CHANNEL = "general";

export function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { client, activeChannel, connected, switchChannel, error } = useStream(user);
  const [activeChannelId, setActiveChannelId] = useState<string>(DEFAULT_CHANNEL);

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);


  const handleChannelSelect = (channelId: string) => {
    setActiveChannelId(channelId);
    switchChannel(channelId);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <p className="text-red-600 font-semibold mb-2">Connection failed</p>
          <p className="text-gray-500 text-sm bg-red-50 border border-red-200 rounded p-3">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded text-sm">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user || !client || !connected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          client={client}
          activeChannelId={activeChannelId}
          onChannelSelect={handleChannelSelect}
          userId={user.userId}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeChannel ? (
            <StreamChatProvider client={client} theme="messaging light">
              <Chat
                client={client}
                channel={activeChannel}
                userId={user.userId}
                channelId={activeChannelId}
              />
            </StreamChatProvider>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <p>Select a channel to start chatting</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

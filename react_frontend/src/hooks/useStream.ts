import { useState, useEffect, useCallback } from "react";
import { StreamChat, Channel as StreamChannel } from "stream-chat";
import { User } from "../types";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY as string;

export function useStream(user: User | null) {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [activeChannel, setActiveChannel] = useState<StreamChannel | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let mounted = true;

    async function connect() {
      try {
        const chatClient = new StreamChat(STREAM_API_KEY);

        await chatClient.connectUser(
          { id: user!.userId, name: user!.username },
          user!.token
        );

        if (!mounted) {
          await chatClient.disconnectUser();
          return;
        }

        setClient(chatClient);
        setConnected(true);

        // Now join default channel
        try {
          const channel = chatClient.channel("messaging", "general", {
            name: "general",
            members: [user!.userId],
          });
          await channel.watch();
          if (mounted) setActiveChannel(channel);
        } catch (chanErr) {
          console.error("Failed to join general channel:", chanErr);
        }

      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("Stream connection failed:", msg);
        if (mounted) setError(msg);
      }
    }

    connect();

    return () => {
      mounted = false;
    };
  }, [user?.userId]);

  const switchChannel = useCallback(
    async (channelId: string) => {
      if (!client || !user) return;
      try {
        const channel = client.channel("messaging", channelId, {
          name: channelId,
          members: [user.userId],
        });
        await channel.watch();
        setActiveChannel(channel);
      } catch (err) {
        console.error("switchChannel failed:", err);
      }
    },
    [client, user]
  );

  return { client, activeChannel, connected, switchChannel, error };
}

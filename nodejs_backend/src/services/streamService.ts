import { StreamChat } from "stream-chat";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.STREAM_API_KEY!;
const apiSecret = process.env.STREAM_API_SECRET!;

export const serverClient = new StreamChat(apiKey, apiSecret);

export async function createStreamUser(userId: string, userName: string): Promise<void> {
  await serverClient.upsertUser({
    id: userId,
    name: userName,
    role: "user",
  });
}

export function generateStreamToken(userId: string): string {
  return serverClient.createToken(userId);
}

export async function getOrCreateChannel(
  channelId: string,
  createdBy: string
): Promise<ReturnType<typeof serverClient.channel>> {
  const channel = serverClient.channel("messaging", channelId, {
    name: channelId,
    created_by_id: createdBy,
  });
  await channel.create();
  return channel;
}

export async function sendMessageToChannel(
  channelId: string,
  senderId: string,
  text: string
): Promise<void> {
  // Ensure the sender user exists in Stream
  await serverClient.upsertUser({
    id: senderId,
    name: senderId === "ai-assistant" ? "AI Assistant" : senderId,
    role: "user",
  });

  const channel = serverClient.channel("messaging", channelId);

  // Add the sender as a member so they can post in the channel
  await channel.addMembers([senderId]);

  await channel.sendMessage({
    text,
    user_id: senderId,
  });
}

export async function addMemberToChannel(
  channelId: string,
  userId: string
): Promise<void> {
  const channel = serverClient.channel("messaging", channelId);
  await channel.addMembers([userId]);
}

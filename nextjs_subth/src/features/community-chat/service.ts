import { API_URL, API_ROUTES } from "@/lib/constants";
import type { ChatMessage } from "./types";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { message: string };
}

// Get chat messages
export async function getMessages(
  limit = 50,
  before?: string
): Promise<ChatMessage[]> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (before) {
    params.set("before", before);
  }

  const res = await fetch(
    `${API_URL}${API_ROUTES.COMMUNITY_CHAT.MESSAGES}?${params.toString()}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch messages");
  }

  const json: ApiResponse<ChatMessage[]> = await res.json();
  if (!json.success) {
    throw new Error(json.error?.message || "Failed to fetch messages");
  }

  return json.data;
}

// Get online count
export async function getOnlineCount(): Promise<number> {
  const res = await fetch(`${API_URL}${API_ROUTES.COMMUNITY_CHAT.ONLINE}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return 0;
  }

  const json: ApiResponse<{ count: number }> = await res.json();
  return json.data.count;
}

// Delete message (requires auth)
export async function deleteMessage(
  id: string,
  token: string
): Promise<void> {
  const res = await fetch(
    `${API_URL}${API_ROUTES.COMMUNITY_CHAT.DELETE(id)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error?.message || "Failed to delete message");
  }
}

// Get WebSocket URL
export function getWebSocketUrl(token: string): string {
  const wsBase = API_URL.replace(/^http/, "ws");
  return `${wsBase}${API_ROUTES.COMMUNITY_CHAT.WS}?token=${token}`;
}

// Video search result for mention
export interface VideoSearchResult {
  id: string;
  code: string;
  title: string;
  thumbnail: string;
}

// Search videos for mention (quick search by code)
export async function searchVideosForMention(
  query: string,
  limit = 5
): Promise<VideoSearchResult[]> {
  if (!query || query.length < 2) return [];

  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
  });

  const res = await fetch(
    `${API_URL}${API_ROUTES.VIDEOS.SEARCH}?${params.toString()}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return [];
  }

  const json: ApiResponse<{ videos: VideoSearchResult[] }> = await res.json();
  if (!json.success) {
    return [];
  }

  return json.data.videos || [];
}

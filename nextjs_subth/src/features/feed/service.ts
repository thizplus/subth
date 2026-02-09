import { API_ROUTES } from "@/lib/constants";
import { apiClient } from "@/lib/api-client";
import type { FeedListResponse, ReelListResponse, FeedListParams } from "./types";

export const feedService = {
  // Get feed items for home page (cover images)
  async getFeed(params?: FeedListParams): Promise<FeedListResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(params?.page || 1));
    searchParams.set("limit", String(params?.limit || 20));
    if (params?.lang) searchParams.set("lang", params.lang);

    return apiClient.serverGetRaw<FeedListResponse>(
      `${API_ROUTES.FEED.LIST}?${searchParams.toString()}`,
      { revalidate: 60 }
    );
  },

  // Get reels for reels page (videos)
  async getReels(params?: FeedListParams): Promise<ReelListResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("page", String(params?.page || 1));
    searchParams.set("limit", String(params?.limit || 10));
    if (params?.lang) searchParams.set("lang", params.lang);

    return apiClient.serverGetRaw<ReelListResponse>(
      `${API_ROUTES.FEED.REELS}?${searchParams.toString()}`,
      { revalidate: 60 }
    );
  },
};

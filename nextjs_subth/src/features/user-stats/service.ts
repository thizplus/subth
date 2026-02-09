import { apiClient } from "@/lib/api-client";
import { API_ROUTES } from "@/lib/constants";
import type { UserStats, TitleHistory, AddXPRequest, AddXPResponse, RecordViewRequest, RecordViewResponse } from "./types";

export const userStatsService = {
  // Get my stats (authenticated)
  getMyStats(): Promise<UserStats> {
    return apiClient.get<UserStats>(API_ROUTES.USER_STATS.ME);
  },

  // Get user stats by ID (public)
  getUserStats(userId: string): Promise<UserStats> {
    return apiClient.publicGet<UserStats>(API_ROUTES.USER_STATS.BY_USER(userId));
  },

  // Add XP
  addXP(request: AddXPRequest): Promise<AddXPResponse> {
    return apiClient.post<AddXPResponse>(API_ROUTES.USER_STATS.ADD_XP, request);
  },

  // Regenerate title
  regenerateTitle(): Promise<UserStats> {
    return apiClient.post<UserStats>(API_ROUTES.USER_STATS.REGENERATE_TITLE);
  },

  // Get title history
  getTitleHistory(): Promise<TitleHistory[]> {
    return apiClient.get<TitleHistory[]>(API_ROUTES.USER_STATS.TITLES);
  },

  // Record login (adds daily XP)
  recordLogin(): Promise<UserStats> {
    return apiClient.post<UserStats>(API_ROUTES.USER_STATS.LOGIN);
  },

  // Record video view (awards XP if criteria met)
  recordView(reelId: string, request: RecordViewRequest): Promise<RecordViewResponse> {
    return apiClient.post<RecordViewResponse>(API_ROUTES.REELS.VIEW(reelId), request);
  },
};

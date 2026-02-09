import { apiClient } from "@/lib/api-client";
import { API_ROUTES } from "@/lib/constants";
import type { LogActivityRequest, LogActivityResponse, ActivityLog, PageViewCount, PageType } from "./types";

export const activityService = {
  /**
   * Log user activity (Fire & Forget)
   * บันทึกการเข้าถึงหน้าต่างๆ
   */
  logActivity(request: LogActivityRequest): Promise<LogActivityResponse> {
    return apiClient.post<LogActivityResponse>(API_ROUTES.ACTIVITY.LOG, request);
  },

  /**
   * Get my activity history
   * ดึงประวัติการเข้าชมของตัวเอง
   */
  async getMyHistory(page = 1, limit = 20): Promise<{ data: ActivityLog[]; total: number }> {
    const result = await apiClient.getPaginated<ActivityLog>(
      `${API_ROUTES.ACTIVITY.ME}?page=${page}&limit=${limit}`
    );
    return { data: result.data, total: result.meta.total };
  },

  /**
   * Get page view count (Public)
   * ดึงจำนวน views ของ page
   */
  async getPageViews(pageType: PageType, pageId?: string): Promise<PageViewCount> {
    const params = new URLSearchParams({ pageType });
    if (pageId) params.append("pageId", pageId);
    return apiClient.publicGet<PageViewCount>(`${API_ROUTES.ACTIVITY.VIEWS}?${params}`);
  },
};

import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth";
import { activityService } from "./service";
import type { LogActivityRequest, PageType } from "./types";

// Query keys
export const activityKeys = {
  all: ["activity"] as const,
  history: (page: number, limit: number) => [...activityKeys.all, "history", page, limit] as const,
  pageViews: (pageType: PageType, pageId?: string) => [...activityKeys.all, "views", pageType, pageId] as const,
};

/**
 * Hook สำหรับ log activity (Fire & Forget)
 * ใช้ใน ActivityLogger component
 */
export function useLogActivity() {
  return useMutation({
    mutationFn: (request: LogActivityRequest) => activityService.logActivity(request),
    // ไม่ต้อง handle success/error เพราะเป็น Fire & Forget
  });
}

/**
 * Hook สำหรับดึงประวัติ activity ของตัวเอง
 */
export function useMyActivityHistory(page = 1, limit = 20) {
  const isAuthenticated = useAuthStore((state) => !!state.token);

  return useQuery({
    queryKey: activityKeys.history(page, limit),
    queryFn: () => activityService.getMyHistory(page, limit),
    staleTime: 1000 * 60, // 1 minute
    enabled: isAuthenticated, // ไม่ fetch ถ้ายังไม่ login
  });
}

/**
 * Hook สำหรับดึง view count ของ page
 */
export function usePageViews(pageType: PageType, pageId?: string) {
  return useQuery({
    queryKey: activityKeys.pageViews(pageType, pageId),
    queryFn: () => activityService.getPageViews(pageType, pageId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

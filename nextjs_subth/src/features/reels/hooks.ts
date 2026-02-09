"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth";
import { apiClient } from "@/lib/api-client";
import { API_ROUTES } from "@/lib/constants";
import type { ReelListResponse, ReelListParams } from "./types";

// Client-side fetch function for React Query
async function fetchReels(params: ReelListParams): Promise<ReelListResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page || 1));
  searchParams.set("limit", String(params.limit || 10));
  if (params.lang) searchParams.set("lang", params.lang);

  return apiClient.getRaw<ReelListResponse>(
    `${API_ROUTES.FEED.REELS}?${searchParams.toString()}`
  );
}

// Query keys
export const reelsKeys = {
  all: ["reels"] as const,
  list: (params?: ReelListParams) => [...reelsKeys.all, "list", params] as const,
  detail: (id: string) => [...reelsKeys.all, "detail", id] as const,
};

// Infinite scroll hook
export function useInfiniteReels(
  params?: Omit<ReelListParams, "page">,
  initialData?: ReelListResponse
) {
  // Get token for authenticated requests (to get isLiked status)
  const token = useAuthStore((state) => state.token);

  return useInfiniteQuery({
    queryKey: [...reelsKeys.list(params), !!token],
    queryFn: ({ pageParam = 1 }) =>
      fetchReels({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined,
    initialPageParam: 1,
    // Only use initialData when not authenticated (server-side data doesn't have isLiked)
    initialData: !token && initialData
      ? {
          pages: [initialData],
          pageParams: [1],
        }
      : undefined,
    // Refetch immediately when authenticated to get isLiked status
    staleTime: token ? 0 : 30 * 1000,
  });
}

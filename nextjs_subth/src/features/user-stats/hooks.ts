"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth";
import { userStatsService } from "./service";
import { showXPNotification } from "@/features/engagement";
import type { RecordViewRequest } from "./types";

export const userStatsKeys = {
  all: ["user-stats"] as const,
  myStats: () => [...userStatsKeys.all, "my"] as const,
  titleHistory: () => [...userStatsKeys.all, "titles"] as const,
};

export function useMyStats() {
  const isAuthenticated = useAuthStore((state) => !!state.token);

  return useQuery({
    queryKey: userStatsKeys.myStats(),
    queryFn: () => userStatsService.getMyStats(),
    staleTime: 60 * 1000, // 1 minute
    retry: false,
    enabled: isAuthenticated, // ไม่ fetch ถ้ายังไม่ login
  });
}

export function useTitleHistory() {
  return useQuery({
    queryKey: userStatsKeys.titleHistory(),
    queryFn: () => userStatsService.getTitleHistory(),
    staleTime: 60 * 1000,
    retry: false,
  });
}

export function useRecordView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reelId, data }: { reelId: string; data: RecordViewRequest }) =>
      userStatsService.recordView(reelId, data),
    onSuccess: (result) => {
      // Show XP notification if awarded
      if (result.xpAwarded && result.xpAmount > 0) {
        showXPNotification({
          amount: result.xpAmount,
          source: "view",
          leveledUp: result.leveledUp,
          newLevel: result.newLevel,
        });
      }
      // Invalidate user stats to refresh
      queryClient.invalidateQueries({ queryKey: userStatsKeys.myStats() });
    },
  });
}

"use client";

import { useMemo } from "react";
import { ReelsLayout } from "./reels-layout";
import { ReelsFeed } from "./reels-feed";
import { useInfiniteReels } from "../hooks";
import type { ReelItem } from "../types";

// Accept data from feed service (server-side)
interface InitialData {
  success: boolean;
  data: Array<{
    id: string;
    title: string;
    description?: string;
    videoUrl: string;
    thumbUrl: string;
    coverUrl?: string;
    tags: string[];
    createdAt: string;
  }>;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface ReelsPageClientProps {
  initialData: InitialData;
}

/**
 * ReelsPageClient - Client Component for Reels Page
 *
 * Handles:
 * - React Query infinite scroll
 * - TikTok-style UI
 */
export function ReelsPageClient({ initialData }: ReelsPageClientProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteReels({ limit: 10 }, initialData as any);

  // Flatten pages to single array and map to ReelItem
  const reels = useMemo((): ReelItem[] => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) =>
      page.data.map((item) => ({
        ...item,
        likeCount: item.likeCount ?? 0,
        commentCount: item.commentCount ?? 0,
        isLiked: item.isLiked ?? false,
        isSaved: false,
      }))
    );
  }, [data]);

  return (
    <ReelsLayout title="Reels">
      <ReelsFeed
        reels={reels}
        hasMore={hasNextPage}
        isLoading={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
      />
    </ReelsLayout>
  );
}

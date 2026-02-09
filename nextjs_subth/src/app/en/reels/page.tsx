import { feedService, type ReelListResponse } from "@/features/feed";
import { ReelsPageClient } from "@/features/reels";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reels - SubTH",
  description: "Watch short clips on SubTH",
  openGraph: {
    title: "Reels - SubTH",
    description: "Watch short clips on SubTH",
  },
};

/**
 * Public Reels Page - English (TikTok Style)
 */
export default async function EnglishReelsPage() {
  let initialData: ReelListResponse = {
    success: true,
    data: [],
    meta: { total: 0, page: 1, limit: 10, totalPages: 0, hasNext: false, hasPrev: false },
  };

  try {
    initialData = await feedService.getReels({ page: 1, limit: 10, lang: "en" });
  } catch (error) {
    console.error("Failed to fetch initial reels:", error);
  }

  return <ReelsPageClient initialData={initialData} />;
}

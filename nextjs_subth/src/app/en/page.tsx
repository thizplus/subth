import { PublicLayout } from "@/components/layout/server";
import { feedService, FeedPageClient, type FeedListResponse } from "@/features/feed";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SubTH - JAV AV Chinese Western OnlyFans Reviews",
  description: "Video reviews with Thai subtitles. JAV, AV, Chinese, Western, OnlyFans content reviews updated daily with cast info, studios and tags.",
  openGraph: {
    title: "SubTH - JAV AV Chinese Western OnlyFans Reviews",
    description: "Video reviews with Thai subtitles. JAV, AV, Chinese, Western, OnlyFans updated daily.",
    url: "https://subth.com/en",
  },
  alternates: {
    canonical: "https://subth.com/en",
  },
};

/**
 * Public Feed Page - English (Social Style with Sidebar)
 */
export default async function EnglishHomePage() {
  let initialData: FeedListResponse = {
    success: true,
    data: [],
    meta: { total: 0, page: 1, limit: 20, totalPages: 0, hasNext: false, hasPrev: false },
  };

  try {
    initialData = await feedService.getFeed({ page: 1, limit: 20, lang: "en" });
  } catch (error) {
    console.error("Failed to fetch initial feed:", error);
  }

  return (
    <PublicLayout locale="en">
      <div className="max-w-lg mx-auto">
        {/* Hero section - left aligned text */}
        <section className="mb-6 px-4 sm:px-0">
          <h1 className="mb-2 text-2xl font-bold">SubTH</h1>
          <p className="text-muted-foreground text-sm">
            JAV AV Chinese Western OnlyFans reviews updated daily
          </p>
        </section>

        {/* Infinite Scroll Feed - edge-to-edge on mobile */}
        <FeedPageClient initialData={initialData} locale="en" />
      </div>
    </PublicLayout>
  );
}

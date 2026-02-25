import { PublicLayout } from "@/components/layout/server";
import { feedService, FeedPageClient, type FeedListResponse } from "@/features/feed";
import { PageActivityLogger } from "@/features/activity";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ซับไทย - รีวิว JAV AV จีน ฝรั่ง OnlyFans ใหม่ล่าสุด",
  description: "รวมรีวิววิดีโอซับไทย JAV AV หนังจีน หนังฝรั่ง OnlyFans อัปเดตใหม่ทุกวัน พร้อมข้อมูลนักแสดง ค่ายผลิต และแท็กยอดนิยม",
  openGraph: {
    title: "ซับไทย - รีวิว JAV AV จีน ฝรั่ง OnlyFans ใหม่ล่าสุด",
    description: "รวมรีวิววิดีโอซับไทย JAV AV หนังจีน หนังฝรั่ง OnlyFans อัปเดตใหม่ทุกวัน",
    url: "https://subth.com",
  },
  alternates: {
    canonical: "https://subth.com",
    languages: {
      th: "https://subth.com",
      en: "https://subth.com/en",
    },
  },
};

/**
 * Public Feed Page (Social Style with Sidebar)
 */
export default async function HomePage() {
  let initialData: FeedListResponse = {
    success: true,
    data: [],
    meta: { total: 0, page: 1, limit: 20, totalPages: 0, hasNext: false, hasPrev: false },
  };

  try {
    initialData = await feedService.getFeed({ page: 1, limit: 20, lang: "th" });
  } catch (error) {
    console.error("Failed to fetch initial feed:", error);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ซับไทย SubTH",
    alternateName: ["SubTH", "ซับไทย", "Subthai"],
    url: "https://subth.com",
    description: "เว็บรีวิววิดีโอซับไทย JAV AV จีน ฝรั่ง OnlyFans",
    inLanguage: ["th", "en"],
    publisher: {
      "@type": "Organization",
      name: "SubTH",
      url: "https://subth.com",
    },
  };

  return (
    <PublicLayout locale="th">
      {/* Activity Logger */}
      <PageActivityLogger pageType="feed" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-lg mx-auto">
        {/* Hero section - left aligned text */}
        <section className="mb-6 px-4 sm:px-0">
          <h1 className="mb-2 text-2xl font-bold">ซับไทย</h1>
          <p className="text-muted-foreground text-sm">
            รีวิววิดีโอ JAV AV จีน ฝรั่ง OnlyFans อัปเดตใหม่ทุกวัน
          </p>
        </section>

        {/* Infinite Scroll Feed - edge-to-edge on mobile */}
        <FeedPageClient initialData={initialData} locale="th" />
      </div>
    </PublicLayout>
  );
}

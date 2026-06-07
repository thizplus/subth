import { VideoGrid } from "@/features/video/components";
import { videoService } from "@/features/video/service";
import type { CategoryWithVideos } from "@/features/video/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SubTH - JAV ซับไทย | ดูฟรี อัปเดตทุกวัน",
  description:
    "ดู JAV ซับไทย ฟรี คัดสรรจากค่ายดัง S1, MOODYZ, Prestige อัปเดตใหม่ทุกวัน จัดหมวดหมู่ครบ ค้นหาตามนักแสดง ค่าย แท็กได้ง่าย",
  keywords: [
    "jav ซับไทย",
    "jav subtitle thai",
    "ดู jav ซับไทย",
    "jav ซับไทย ฟรี",
    "av ซับไทย",
    "หนัง av ซับไทย ใหม่ล่าสุด",
  ],
  openGraph: {
    title: "SubTH - JAV ซับไทย | ดูฟรี อัปเดตทุกวัน",
    description:
      "ดู JAV ซับไทย ฟรี คัดสรรจากค่ายดัง อัปเดตใหม่ทุกวัน จัดหมวดหมู่ครบ",
    url: "https://subth.com",
    type: "website",
    siteName: "SubTH",
  },
  alternates: {
    canonical: "https://subth.com",
    languages: {
      th: "https://subth.com",
      en: "https://subth.com/en",
    },
  },
};

export default async function HomePage() {
  const dict = await getDictionary("th");

  let categoryGroups: CategoryWithVideos[] = [];

  try {
    categoryGroups = await videoService.getByCategories({
      limit: 6,
      lang: "th",
    });
  } catch (e) {
    console.error("Failed to fetch videos by categories:", e);
  }

  // Website Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SubTH - JAV ซับไทย",
    alternateName: ["SubTH", "ซับไทย"],
    url: "https://subth.com",
    description: "ดู JAV ซับไทย ฟรี อัปเดตใหม่ทุกวัน",
    inLanguage: ["th", "en"],
    potentialAction: {
      "@type": "SearchAction",
      target: "https://subth.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <div className="space-y-6">
        {categoryGroups.map((group, index) => (
          <section key={group.category.id}>
            {index > 0 && <Separator className="mb-6" />}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">
                {group.category.name}{" "}
                <span className="text-muted-foreground">
                  ({group.category.videoCount.toLocaleString()})
                </span>
              </h2>
              <Link
                href={`/category/${group.category.slug}`}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                {dict.common.viewAll}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <VideoGrid videos={group.videos} cols={6} />
          </section>
        ))}

        {categoryGroups.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {dict.common.noData}
          </div>
        )}
      </div>
    </>
  );
}

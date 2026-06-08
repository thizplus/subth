import { VideoGrid } from "@/features/video/components";
import { videoService } from "@/features/video/service";
import type { VideoListItem } from "@/features/video/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import Link from "next/link";
import { ChevronRight, Flame, Clock, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Pagination } from "@/components/ui/pagination";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JAV ซับไทย ดูฟรี อัปเดตทุกวัน | SubTH",
  description:
    "ดู JAV ซับไทย ฟรี คัดสรรจากค่ายดัง S1, MOODYZ, Prestige, Ideapocket อัปเดตใหม่ทุกวัน จัดหมวดหมู่ครบ ค้นหาตามนักแสดง AV ค่ายผลิต แท็กได้ง่าย ไม่มีโฆษณา",
  keywords: [
    "jav ซับไทย",
    "jav subtitle thai",
    "ดู jav ซับไทย",
    "jav ซับไทย ฟรี",
    "av ซับไทย",
    "หนัง av ซับไทย ใหม่ล่าสุด",
    "jav ซับไทย 2025",
    "ดู av ซับไทย ออนไลน์",
    "jav censored ซับไทย",
  ],
  openGraph: {
    title: "JAV ซับไทย ดูฟรี อัปเดตทุกวัน | SubTH",
    description:
      "ดู JAV ซับไทย ฟรี คัดสรรจากค่ายดัง อัปเดตใหม่ทุกวัน ไม่มีโฆษณา รองรับทุกอุปกรณ์",
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

const ITEMS_PER_SECTION = 12;

export default async function HomePage() {
  const dict = await getDictionary("th");

  // Fetch multiple sections in parallel — censored-jav only
  let featured: VideoListItem[] = [];
  let latest: VideoListItem[] = [];
  let popular: VideoListItem[] = [];
  let totalVideos = 0;

  // Random page offset for "Featured" section
  const randomPage = Math.floor(Math.random() * 50) + 2;

  try {
    const [featuredRes, latestRes, popularRes] = await Promise.all([
      videoService.getList({
        limit: ITEMS_PER_SECTION,
        page: randomPage,
        lang: "th",
        sort: "views",
        order: "desc",
        category: "censored-jav",
      }),
      videoService.getList({
        limit: ITEMS_PER_SECTION,
        page: 1,
        lang: "th",
        sort: "created_at",
        order: "desc",
        category: "censored-jav",
      }),
      videoService.getList({
        limit: ITEMS_PER_SECTION,
        page: 1,
        lang: "th",
        sort: "views",
        order: "desc",
        category: "censored-jav",
      }),
    ]);

    featured = featuredRes.data || [];
    latest = latestRes.data || [];
    totalVideos = latestRes.meta?.total || 0;
    popular = popularRes.data || [];
  } catch (e) {
    console.error("Failed to fetch homepage videos:", e);
  }

  const totalPages = Math.ceil(totalVideos / 30);

  // Website Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SubTH - JAV ซับไทย",
    alternateName: ["SubTH", "ซับไทย", "JAV ซับไทย"],
    url: "https://subth.com",
    description: "ดู JAV ซับไทย ฟรี อัปเดตใหม่ทุกวัน ไม่มีโฆษณา",
    inLanguage: ["th", "en"],
    potentialAction: {
      "@type": "SearchAction",
      target: "https://subth.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  // FAQ Schema
  const homeDict = dict.home as Record<string, string>;
  const faqs = Array.from({ length: 10 }, (_, i) => ({
    q: homeDict[`faq${i + 1}q`],
    a: homeDict[`faq${i + 1}a`],
  })).filter((f) => f.q && f.a);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* H1 + Intro */}
      <section className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          {dict.home.h1}
        </h1>
        <p className="text-muted-foreground max-w-3xl">
          {dict.home.intro}
        </p>
      </section>

      {/* Section: Featured / แนะนำประจำวัน */}
      {featured.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">{dict.home.sectionFeatured}</h2>
          </div>
          <VideoGrid videos={featured} cols={6} />
        </section>
      )}

      <Separator className="my-8" />

      {/* Section: Latest / ใหม่ล่าสุด */}
      {latest.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">
                {dict.home.sectionLatest}
                <span className="text-muted-foreground text-base ml-2">
                  ({totalVideos.toLocaleString()})
                </span>
              </h2>
            </div>
            <Link
              href="/page/2"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {dict.common.viewAll}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <VideoGrid videos={latest} cols={6} />
        </section>
      )}

      <Separator className="my-8" />

      {/* Section: Popular / ยอดนิยม */}
      {popular.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-destructive" />
            <h2 className="text-xl font-semibold">{dict.home.sectionPopular}</h2>
          </div>
          <VideoGrid videos={popular} cols={6} />
        </section>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={1}
        totalPages={totalPages}
        basePath=""
      />

      {/* FAQ Section */}
      <section className="mt-12 pt-8 border-t border-border">
        <h2 className="text-xl font-semibold mb-4">{dict.home.faqTitle}</h2>
        <div className="space-y-3 max-w-3xl">
          {faqs.map((faq, i) => (
            <details key={i} className="group p-4 bg-muted/30 rounded-xl border border-border cursor-pointer">
              <summary className="font-medium list-none flex justify-between items-center">
                {faq.q}
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer SEO Content */}
      <section className="mt-10 pt-8 border-t border-border">
        <h2 className="text-lg font-semibold mb-4">{dict.home.footerTitle}</h2>
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed max-w-4xl">
          <p>{dict.home.footerP1}</p>
          <p>{dict.home.footerP2}</p>
          <p>{dict.home.footerP3}</p>
          <p>{dict.home.footerP4}</p>
        </div>
      </section>
    </>
  );
}

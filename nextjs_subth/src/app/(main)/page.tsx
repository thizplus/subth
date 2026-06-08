import { VideoGrid } from "@/features/video/components";
import { videoService } from "@/features/video/service";
import type { CategoryWithVideos } from "@/features/video/types";
import { getDictionary } from "@/lib/i18n/dictionaries";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JAV ซับไทย ดูฟรี อัปเดตทุกวัน | SubTH",
  description:
    "ดู JAV ซับไทย ฟรี คัดสรรจากค่ายดัง S1, MOODYZ, Prestige, Ideapocket อัปเดตใหม่ทุกวัน จัดหมวดหมู่ครบ ค้นหาตามนักแสดง AV ค่ายผลิต แท็กได้ง่าย",
  keywords: [
    "jav ซับไทย",
    "jav subtitle thai",
    "ดู jav ซับไทย",
    "jav ซับไทย ฟรี",
    "av ซับไทย",
    "หนัง av ซับไทย ใหม่ล่าสุด",
    "jav ซับไทย 2025",
    "ดู av ซับไทย ออนไลน์",
  ],
  openGraph: {
    title: "JAV ซับไทย ดูฟรี อัปเดตทุกวัน | SubTH",
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
    alternateName: ["SubTH", "ซับไทย", "JAV ซับไทย"],
    url: "https://subth.com",
    description: "ดู JAV ซับไทย ฟรี อัปเดตใหม่ทุกวัน จากค่ายดังทั่วโลก",
    inLanguage: ["th", "en"],
    potentialAction: {
      "@type": "SearchAction",
      target: "https://subth.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  // FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: dict.home.faq1q, acceptedAnswer: { "@type": "Answer", text: dict.home.faq1a } },
      { "@type": "Question", name: dict.home.faq2q, acceptedAnswer: { "@type": "Answer", text: dict.home.faq2a } },
      { "@type": "Question", name: dict.home.faq3q, acceptedAnswer: { "@type": "Answer", text: dict.home.faq3a } },
      { "@type": "Question", name: dict.home.faq4q, acceptedAnswer: { "@type": "Answer", text: dict.home.faq4a } },
    ],
  };

  const faqs = [
    { q: dict.home.faq1q, a: dict.home.faq1a },
    { q: dict.home.faq2q, a: dict.home.faq2a },
    { q: dict.home.faq3q, a: dict.home.faq3a },
    { q: dict.home.faq4q, a: dict.home.faq4a },
  ];

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

      {/* Video Grid by Category */}
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

      {/* FAQ Section - ล่างสุด สำหรับ SEO */}
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
    </>
  );
}

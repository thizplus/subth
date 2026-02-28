import { PublicLayout } from "@/components/layout/server";
import { articleService, ArticleCard, ItemListSchema } from "@/features/article";
import { PageActivityLogger } from "@/features/activity";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JAV ซับไทย | รีวิวเชิงลึก หนัง AV ญี่ปุ่น ซับไทย อัปเดตทุกวัน",
  description:
    "เว็บรีวิว JAV ซับไทย เชิงลึกที่สุด วิเคราะห์เนื้อเรื่อง นักแสดง AV ค่ายผลิต พร้อมคะแนนรีวิวจากผู้ชม อัปเดตหนัง JAV ใหม่ล่าสุดทุกวัน",
  keywords: [
    "jav ซับไทย",
    "jav subtitle thai",
    "หนัง jav ซับไทย",
    "av ซับไทย",
    "รีวิว jav",
    "jav ซับไทย ใหม่ล่าสุด",
  ],
  openGraph: {
    title: "JAV ซับไทย | รีวิวเชิงลึก หนัง AV ญี่ปุ่น ซับไทย",
    description:
      "เว็บรีวิว JAV ซับไทย เชิงลึกที่สุด วิเคราะห์เนื้อเรื่อง นักแสดง AV อัปเดตใหม่ทุกวัน",
    url: "https://subth.com",
    type: "website",
    siteName: "SubTH - JAV ซับไทย",
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
 * Public Homepage - JAV ซับไทย Reviews
 */
export default async function HomePage() {
  let articles: import("@/features/article").ArticleSummary[] = [];
  let total = 0;

  try {
    const response = await articleService.getList({
      page: 1,
      limit: 12,
      lang: "th",
    });
    articles = response.data || [];
    total = response.meta?.total || 0;
  } catch (error) {
    console.error("Failed to fetch articles:", error);
  }

  // Website Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SubTH - JAV ซับไทย",
    alternateName: ["SubTH", "ซับไทย", "JAV ซับไทย", "JAV Subtitle Thai"],
    url: "https://subth.com",
    description:
      "เว็บรีวิว JAV ซับไทย เชิงลึก วิเคราะห์หนัง AV ญี่ปุ่น พร้อมซับไทย",
    inLanguage: ["th", "en"],
    publisher: {
      "@type": "Organization",
      name: "SubTH",
      url: "https://subth.com",
    },
  };

  // FAQ Schema สำหรับ long-tail keywords
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "JAV ซับไทย คืออะไร?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "JAV ซับไทย คือ หนังผู้ใหญ่ญี่ปุ่น (Japanese Adult Video) ที่มีคำบรรยายภาษาไทย ช่วยให้ผู้ชมชาวไทยเข้าใจเนื้อเรื่องและบทสนทนาได้ดียิ่งขึ้น",
        },
      },
      {
        "@type": "Question",
        name: "SubTH รีวิว JAV อย่างไร?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SubTH รีวิว JAV เชิงลึก โดยวิเคราะห์เนื้อเรื่อง การแสดง คุณภาพการผลิต พร้อมให้ข้อมูลนักแสดง AV ค่ายผลิต และแท็กหมวดหมู่ครบถ้วน",
        },
      },
      {
        "@type": "Question",
        name: "มี JAV ซับไทย ใหม่อัปเดตบ่อยแค่ไหน?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SubTH อัปเดตรีวิว JAV ซับไทย ใหม่ทุกวัน โดยคัดสรรเฉพาะผลงานคุณภาพจากค่ายชั้นนำ พร้อมซับไทยที่แปลอย่างพิถีพิถัน",
        },
      },
    ],
  };

  return (
    <PublicLayout locale="th">
      {/* Activity Logger */}
      <PageActivityLogger pageType="home" />

      {/* ItemList Schema for SEO */}
      <ItemListSchema
        articles={articles}
        listName="รีวิว JAV ซับไทย ล่าสุด"
        listDescription="รวมบทความรีวิว JAV ซับไทย เชิงลึก อัปเดตใหม่ทุกวัน"
        
      />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="mx-auto max-w-7xl px-4">
        {/* Hero Section - SEO Optimized */}
        <section className="mb-8">
          <h1 className="mb-3 text-2xl sm:text-3xl font-bold">
            JAV ซับไทย | รีวิวเชิงลึก อัปเดตทุกวัน
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            ยินดีต้อนรับสู่ <strong>SubTH</strong> เว็บรีวิว{" "}
            <strong>JAV ซับไทย</strong> เชิงลึกที่สุด
            เราคัดสรรและวิเคราะห์หนัง AV ญี่ปุ่นคุณภาพ พร้อมซับไทยที่แปลอย่างพิถีพิถัน
            ให้คุณเข้าใจเนื้อเรื่องได้อย่างลึกซึ้ง ไม่ว่าจะเป็นผลงานจากค่ายดัง
            อย่าง S1, MOODYZ, Prestige หรือนักแสดงสาวยอดนิยม
            เรารีวิวให้คุณครบทุกมิติ
          </p>
        </section>

        {/* Latest Reviews Section */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
            <span className="inline-block w-1 h-6 bg-primary rounded-full"></span>
            รีวิว JAV ซับไทย ล่าสุด
          </h2>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {articles.map((article, index) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  
                  priority={index < 4}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              ยังไม่มีบทความรีวิว
            </div>
          )}

          {/* View All Link */}
          {total > 12 && (
            <div className="mt-6 text-center">
              <a
                href="/articles"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors font-medium"
              >
                ดูรีวิวทั้งหมด {total.toLocaleString()} เรื่อง →
              </a>
            </div>
          )}
        </section>

        {/* Why SubTH Section */}
        <section className="mb-10 py-8 px-6 bg-muted/50 rounded-2xl border border-border">
          <h2 className="mb-4 text-xl font-semibold">
            ทำไมต้องอ่านรีวิว JAV ที่ SubTH?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-background rounded-xl border border-border">
              <h3 className="font-medium mb-2">รีวิวเชิงลึก ไม่ใช่แค่สรุป</h3>
              <p className="text-sm text-muted-foreground">
                วิเคราะห์เนื้อเรื่อง การแสดง และจุดเด่นของแต่ละเรื่อง
                ช่วยให้คุณตัดสินใจได้ว่าเรื่องไหนเหมาะกับรสนิยม
              </p>
            </div>
            <div className="p-4 bg-background rounded-xl border border-border">
              <h3 className="font-medium mb-2">ซับไทยคุณภาพ</h3>
              <p className="text-sm text-muted-foreground">
                คัดเฉพาะผลงานที่มีซับไทยแปลถูกต้อง เข้าใจง่าย
                ไม่ใช่แค่แปลด้วยเครื่อง
              </p>
            </div>
            <div className="p-4 bg-background rounded-xl border border-border">
              <h3 className="font-medium mb-2">อัปเดตทุกวัน</h3>
              <p className="text-sm text-muted-foreground">
                ติดตามผลงานใหม่จากทุกค่ายดัง ไม่พลาดเรื่องฮิตที่กำลังเป็นกระแส
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section - SEO Long-tail Keywords */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
            <span className="inline-block w-1 h-6 bg-primary rounded-full"></span>
            คำถามที่พบบ่อย
          </h2>
          <div className="space-y-3">
            <details className="group p-4 bg-muted/30 rounded-xl border border-border cursor-pointer">
              <summary className="font-medium list-none flex justify-between items-center">
                JAV ซับไทย คืออะไร?
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                <strong>JAV ซับไทย</strong> คือ หนังผู้ใหญ่ญี่ปุ่น (Japanese
                Adult Video) ที่มีคำบรรยายภาษาไทย
                ช่วยให้ผู้ชมชาวไทยเข้าใจเนื้อเรื่องและบทสนทนาได้ดียิ่งขึ้น
                ทำให้การรับชมสนุกและมีอรรถรสมากกว่าการดูแบบไม่มีซับ
              </p>
            </details>

            <details className="group p-4 bg-muted/30 rounded-xl border border-border cursor-pointer">
              <summary className="font-medium list-none flex justify-between items-center">
                SubTH รีวิว JAV ซับไทย อย่างไร?
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                SubTH รีวิว <strong>JAV ซับไทย</strong> เชิงลึก
                โดยวิเคราะห์เนื้อเรื่อง การแสดงของนักแสดง AV คุณภาพการผลิต
                และความสมบูรณ์ของซับไทย พร้อมให้ข้อมูลนักแสดง ค่ายผลิต
                และแท็กหมวดหมู่ครบถ้วน ช่วยให้คุณเลือกดูได้ตรงรสนิยม
              </p>
            </details>

            <details className="group p-4 bg-muted/30 rounded-xl border border-border cursor-pointer">
              <summary className="font-medium list-none flex justify-between items-center">
                มี JAV ซับไทย ใหม่อัปเดตบ่อยแค่ไหน?
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                SubTH อัปเดตรีวิว <strong>JAV ซับไทย</strong> ใหม่ทุกวัน
                โดยคัดสรรเฉพาะผลงานคุณภาพจากค่ายชั้นนำอย่าง S1, MOODYZ, Ideapocket,
                Prestige และอื่นๆ พร้อมซับไทยที่แปลอย่างพิถีพิถัน
              </p>
            </details>

            <details className="group p-4 bg-muted/30 rounded-xl border border-border cursor-pointer">
              <summary className="font-medium list-none flex justify-between items-center">
                ค้นหา JAV ตามนักแสดงหรือค่ายได้ไหม?
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                ได้ครับ SubTH มีระบบค้นหาและกรองตามนักแสดง AV, ค่ายผลิต
                และแท็กหมวดหมู่ ทำให้คุณหาเรื่องที่ชอบได้ง่ายๆ
                ไม่ว่าจะชอบสาวคนไหนหรือแนวไหนก็หาได้
              </p>
            </details>
          </div>
        </section>

        {/* About Section */}
        <section className="py-6 border-t border-border">
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
            <strong>SubTH</strong> คือเว็บรีวิว JAV ซับไทย
            ที่มุ่งเน้นการนำเสนอบทความรีวิวเชิงลึก
            เราเชื่อว่าการดูหนังที่ดีไม่ใช่แค่ภาพสวย
            แต่ต้องเข้าใจเรื่องราวด้วย ซับไทยจึงเป็นสิ่งสำคัญ
            ติดตามรีวิวใหม่ได้ทุกวันที่นี่
          </p>
        </section>
      </div>
    </PublicLayout>
  );
}

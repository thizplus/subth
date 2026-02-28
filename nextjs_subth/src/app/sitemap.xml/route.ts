import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/constants";

/**
 * Sitemap Index - ชี้ไปยัง child sitemaps
 * Format: https://www.sitemaps.org/protocol.html#index
 */
export async function GET() {
  // TODO: ดึง lastmod จริงจาก API (เช่น latest article publishedAt)
  const now = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const sitemaps = [
    { loc: `${SITE_URL}/sitemap/static.xml`, lastmod: now },
    { loc: `${SITE_URL}/sitemap/articles.xml`, lastmod: now },
    { loc: `${SITE_URL}/sitemap/casts.xml`, lastmod: now },
    { loc: `${SITE_URL}/sitemap/tags.xml`, lastmod: now },
    { loc: `${SITE_URL}/sitemap/makers.xml`, lastmod: now },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (s) => `  <sitemap>
    <loc>${s.loc}</loc>
    <lastmod>${s.lastmod}</lastmod>
  </sitemap>`
  )
  .join("\n")}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

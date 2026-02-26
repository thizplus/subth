import { NextResponse } from "next/server";

const BASE_URL = "https://subth.com";

export async function GET() {
  const now = new Date().toISOString();

  const urls = [
    // TH - Primary
    { loc: BASE_URL, priority: "1.0", changefreq: "daily" },
    { loc: `${BASE_URL}/articles`, priority: "0.9", changefreq: "daily" },
    { loc: `${BASE_URL}/casts`, priority: "0.8", changefreq: "weekly" },
    { loc: `${BASE_URL}/tags`, priority: "0.8", changefreq: "weekly" },
    { loc: `${BASE_URL}/makers`, priority: "0.8", changefreq: "weekly" },
    { loc: `${BASE_URL}/about`, priority: "0.5", changefreq: "monthly" },
    { loc: `${BASE_URL}/contact`, priority: "0.5", changefreq: "monthly" },
    { loc: `${BASE_URL}/privacy-policy`, priority: "0.3", changefreq: "yearly" },
    { loc: `${BASE_URL}/terms-of-service`, priority: "0.3", changefreq: "yearly" },
    // EN - Secondary
    { loc: `${BASE_URL}/en`, priority: "0.9", changefreq: "daily" },
    { loc: `${BASE_URL}/en/articles`, priority: "0.8", changefreq: "daily" },
    { loc: `${BASE_URL}/en/casts`, priority: "0.7", changefreq: "weekly" },
    { loc: `${BASE_URL}/en/tags`, priority: "0.7", changefreq: "weekly" },
    { loc: `${BASE_URL}/en/makers`, priority: "0.7", changefreq: "weekly" },
    { loc: `${BASE_URL}/en/about`, priority: "0.4", changefreq: "monthly" },
    { loc: `${BASE_URL}/en/contact`, priority: "0.4", changefreq: "monthly" },
    { loc: `${BASE_URL}/en/privacy-policy`, priority: "0.2", changefreq: "yearly" },
    { loc: `${BASE_URL}/en/terms-of-service`, priority: "0.2", changefreq: "yearly" },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

import { NextResponse } from "next/server";

const BASE_URL = "https://subth.com";
const API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

interface SitemapEntity {
  slug: string;
}

interface EntityListResponse {
  success: boolean;
  data: SitemapEntity[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

async function fetchAllTags(): Promise<SitemapEntity[]> {
  const entities: SitemapEntity[] = [];
  let page = 1;
  const limit = 500;

  try {
    while (true) {
      const response = await fetch(
        `${API_URL}/api/v1/tags?limit=${limit}&page=${page}&hasArticles=true`,
        { next: { revalidate: 86400 } }
      );

      if (!response.ok) break;

      const data: EntityListResponse = await response.json();
      entities.push(...data.data);

      if (page >= data.meta.totalPages) break;
      page++;
    }
  } catch (error) {
    console.error("Failed to fetch tags for sitemap:", error);
  }

  return entities;
}

export async function GET() {
  const now = new Date().toISOString();
  const tags = await fetchAllTags();

  const urls = tags.flatMap((tag) => [
    {
      loc: `${BASE_URL}/tags/${tag.slug}`,
      lastmod: now,
      priority: "0.6",
      changefreq: "weekly",
    },
    {
      loc: `${BASE_URL}/en/tags/${tag.slug}`,
      lastmod: now,
      priority: "0.5",
      changefreq: "weekly",
    },
  ]);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
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

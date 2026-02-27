import { NextResponse } from "next/server";

const BASE_URL = "https://subth.com";
const API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

interface SitemapArticle {
  slug: string;
  publishedAt: string;
}

interface ArticleListResponse {
  success: boolean;
  data: SitemapArticle[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

async function fetchAllArticles(): Promise<SitemapArticle[]> {
  const articles: SitemapArticle[] = [];
  let page = 1;
  const limit = 100;

  try {
    while (true) {
      const response = await fetch(
        `${API_URL}/api/v1/articles/public?page=${page}&limit=${limit}`,
        { next: { revalidate: 3600 } }
      );

      if (!response.ok) break;

      const data: ArticleListResponse = await response.json();
      articles.push(...data.data);

      if (page >= data.meta.totalPages) break;
      page++;
    }
  } catch (error) {
    console.error("Failed to fetch articles for sitemap:", error);
  }

  return articles;
}

export async function GET() {
  const articles = await fetchAllArticles();

  const urls = articles.flatMap((article) => [
    {
      loc: `${BASE_URL}/articles/review/${article.slug}`,
      lastmod: new Date(article.publishedAt).toISOString(),
      priority: "0.8",
      changefreq: "weekly",
    },
    {
      loc: `${BASE_URL}/en/articles/review/${article.slug}`,
      lastmod: new Date(article.publishedAt).toISOString(),
      priority: "0.7",
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
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

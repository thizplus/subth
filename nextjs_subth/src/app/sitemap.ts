import type { MetadataRoute } from "next";
import { API_URL } from "@/lib/constants";

const BASE_URL = "https://subth.com";

// Types for sitemap data
interface SitemapArticle {
  slug: string;
  publishedAt: string;
}

interface SitemapEntity {
  slug: string;
}

interface ArticleListResponse {
  success: boolean;
  data: SitemapArticle[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

interface EntityListResponse {
  success: boolean;
  data: SitemapEntity[];
  meta: { total: number };
}

// Generate sitemap index with multiple sitemaps (0-9)
// Next.js 16 requires NUMERIC IDs, not strings
export async function generateSitemaps() {
  return [
    { id: 0 }, // pages-th
    { id: 1 }, // pages-en
    { id: 2 }, // articles-th
    { id: 3 }, // articles-en
    { id: 4 }, // casts-th
    { id: 5 }, // casts-en
    { id: 6 }, // tags-th
    { id: 7 }, // tags-en
    { id: 8 }, // makers-th
    { id: 9 }, // makers-en
  ];
}

// Fetch all articles (paginated)
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

// Fetch all entities (casts, tags, makers) - only those with published articles
async function fetchAllEntities(endpoint: string): Promise<SitemapEntity[]> {
  const entities: SitemapEntity[] = [];
  let page = 1;
  const limit = 500;

  try {
    while (true) {
      // hasArticles=true filters only entities with published articles
      const response = await fetch(
        `${API_URL}${endpoint}?limit=${limit}&page=${page}&hasArticles=true`,
        { next: { revalidate: 3600 } }
      );

      if (!response.ok) break;

      const data: EntityListResponse = await response.json();
      entities.push(...data.data);

      if (data.data.length < limit) break;
      page++;
    }
  } catch (error) {
    console.error(`Failed to fetch ${endpoint} for sitemap:`, error);
  }

  return entities;
}

// Generate static pages sitemap
function generateStaticPages(lang: "th" | "en"): MetadataRoute.Sitemap {
  const now = new Date();
  const prefix = lang === "en" ? "/en" : "";
  const priorityOffset = lang === "en" ? 0.1 : 0;

  return [
    {
      url: prefix ? `${BASE_URL}${prefix}` : BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1 - priorityOffset,
    },
    {
      url: `${BASE_URL}${prefix}/articles`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9 - priorityOffset,
    },
    {
      url: `${BASE_URL}${prefix}/casts`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8 - priorityOffset,
    },
    {
      url: `${BASE_URL}${prefix}/tags`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8 - priorityOffset,
    },
    {
      url: `${BASE_URL}${prefix}/makers`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8 - priorityOffset,
    },
    {
      url: `${BASE_URL}${prefix}/reels`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7 - priorityOffset,
    },
  ];
}

// Generate article pages sitemap
async function generateArticlePages(
  lang: "th" | "en"
): Promise<MetadataRoute.Sitemap> {
  const articles = await fetchAllArticles();
  const prefix = lang === "en" ? "/en" : "";
  const priority = lang === "en" ? 0.7 : 0.8;

  return articles.map((article) => ({
    url: `${BASE_URL}${prefix}/articles/${article.slug}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: "weekly" as const,
    priority,
  }));
}

// Generate entity pages sitemap (casts, tags, makers)
async function generateEntityPages(
  endpoint: string,
  pathPrefix: string,
  lang: "th" | "en"
): Promise<MetadataRoute.Sitemap> {
  const entities = await fetchAllEntities(endpoint);
  const now = new Date();
  const langPrefix = lang === "en" ? "/en" : "";
  const priority = lang === "en" ? 0.5 : 0.6;

  return entities.map((entity) => ({
    url: `${BASE_URL}${langPrefix}/${pathPrefix}/${entity.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority,
  }));
}

// Main sitemap function - generates sitemap based on numeric ID
export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  // Convert to number in case it comes as string from URL
  const sitemapId = Number(id);

  // Use explicit if-else to avoid type inference issues
  if (sitemapId === 0) return generateStaticPages("th");
  if (sitemapId === 1) return generateStaticPages("en");
  if (sitemapId === 2) return generateArticlePages("th");
  if (sitemapId === 3) return generateArticlePages("en");
  if (sitemapId === 4)
    return generateEntityPages("/api/v1/casts", "casts", "th");
  if (sitemapId === 5)
    return generateEntityPages("/api/v1/casts", "casts", "en");
  if (sitemapId === 6) return generateEntityPages("/api/v1/tags", "tags", "th");
  if (sitemapId === 7) return generateEntityPages("/api/v1/tags", "tags", "en");
  if (sitemapId === 8)
    return generateEntityPages("/api/v1/makers", "makers", "th");
  if (sitemapId === 9)
    return generateEntityPages("/api/v1/makers", "makers", "en");

  return [];
}

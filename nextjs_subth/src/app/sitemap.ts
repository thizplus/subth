import type { MetadataRoute } from "next";

const BASE_URL = "https://subth.com";

// For server-side sitemap generation, use internal Docker network if available
const API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

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
  meta: { total: number; page: number; limit: number; totalPages: number };
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
      const response = await fetch(
        `${API_URL}${endpoint}?limit=${limit}&page=${page}&hasArticles=true`,
        { next: { revalidate: 3600 } }
      );

      if (!response.ok) break;

      const data: EntityListResponse = await response.json();
      entities.push(...data.data);

      if (page >= data.meta.totalPages) break;
      page++;
    }
  } catch (error) {
    console.error(`Failed to fetch ${endpoint} for sitemap:`, error);
  }

  return entities;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages - TH (priority) and EN
  const staticPages: MetadataRoute.Sitemap = [
    // TH
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/articles`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/casts`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/tags`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/makers`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/reels`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    // EN
    { url: `${BASE_URL}/en`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/en/articles`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/en/casts`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/en/tags`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/en/makers`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/en/reels`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
  ];

  // Fetch dynamic content
  const [articles, casts, tags, makers] = await Promise.all([
    fetchAllArticles(),
    fetchAllEntities("/api/v1/casts"),
    fetchAllEntities("/api/v1/tags"),
    fetchAllEntities("/api/v1/makers"),
  ]);

  // Article pages (TH priority, EN secondary)
  const articlePages: MetadataRoute.Sitemap = articles.flatMap((article) => [
    {
      url: `${BASE_URL}/articles/${article.slug}`,
      lastModified: new Date(article.publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/en/articles/${article.slug}`,
      lastModified: new Date(article.publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
  ]);

  // Cast pages (only those with articles)
  const castPages: MetadataRoute.Sitemap = casts.flatMap((cast) => [
    {
      url: `${BASE_URL}/casts/${cast.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/en/casts/${cast.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    },
  ]);

  // Tag pages (only those with articles)
  const tagPages: MetadataRoute.Sitemap = tags.flatMap((tag) => [
    {
      url: `${BASE_URL}/tags/${tag.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/en/tags/${tag.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    },
  ]);

  // Maker pages (only those with articles)
  const makerPages: MetadataRoute.Sitemap = makers.flatMap((maker) => [
    {
      url: `${BASE_URL}/makers/${maker.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/en/makers/${maker.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    },
  ]);

  return [...staticPages, ...articlePages, ...castPages, ...tagPages, ...makerPages];
}

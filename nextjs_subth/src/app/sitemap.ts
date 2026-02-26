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

// Sitemap IDs for generating multiple sitemaps
type SitemapId =
  | "pages-th"
  | "pages-en"
  | "articles-th"
  | "articles-en"
  | "casts-th"
  | "casts-en"
  | "tags-th"
  | "tags-en"
  | "makers-th"
  | "makers-en";

// Generate sitemap index with multiple sitemaps
export async function generateSitemaps(): Promise<{ id: SitemapId }[]> {
  return [
    { id: "pages-th" },
    { id: "pages-en" },
    { id: "articles-th" },
    { id: "articles-en" },
    { id: "casts-th" },
    { id: "casts-en" },
    { id: "tags-th" },
    { id: "tags-en" },
    { id: "makers-th" },
    { id: "makers-en" },
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

// Main sitemap function - generates sitemap based on ID
export default async function sitemap({
  id,
}: {
  id: SitemapId;
}): Promise<MetadataRoute.Sitemap> {
  const [type, lang] = id.split("-") as [string, "th" | "en"];

  switch (type) {
    case "pages":
      return generateStaticPages(lang);

    case "articles":
      return generateArticlePages(lang);

    case "casts":
      return generateEntityPages("/api/v1/casts", "casts", lang);

    case "tags":
      return generateEntityPages("/api/v1/tags", "tags", lang);

    case "makers":
      return generateEntityPages("/api/v1/makers", "makers", lang);

    default:
      return [];
  }
}

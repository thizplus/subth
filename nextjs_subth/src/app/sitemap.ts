import type { MetadataRoute } from "next";

const BASE_URL = "https://subth.com";

// Sitemap Index - ชี้ไปยัง child sitemaps
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: `${BASE_URL}/sitemap/static.xml`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/sitemap/articles.xml`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/sitemap/casts.xml`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/sitemap/tags.xml`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/sitemap/makers.xml`,
      lastModified: now,
    },
  ];
}

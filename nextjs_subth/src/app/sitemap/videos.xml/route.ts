import { NextResponse } from "next/server";

const BASE_URL = "https://subth.com";
const API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

interface SitemapVideo {
  id: string;
  releaseDate?: string;
  updatedAt?: string;
}

interface VideoListResponse {
  success: boolean;
  data: SitemapVideo[];
  meta: { total: number; offset: number; limit: number };
}

async function fetchAllVideos(): Promise<SitemapVideo[]> {
  const videos: SitemapVideo[] = [];
  let page = 1;
  const limit = 100;

  try {
    while (true) {
      const response = await fetch(
        `${API_URL}/api/v1/videos?page=${page}&limit=${limit}`,
        { next: { revalidate: 3600 } }
      );

      if (!response.ok) break;

      const data: VideoListResponse = await response.json();
      videos.push(...data.data);

      if (data.data.length < limit) break;
      page++;
    }
  } catch (error) {
    console.error("Failed to fetch videos for sitemap:", error);
  }

  return videos;
}

export async function GET() {
  const videos = await fetchAllVideos();

  const entries = videos.map((video) => {
    const lastmod = video.releaseDate
      ? new Date(video.releaseDate).toISOString()
      : new Date().toISOString();
    const thUrl = `${BASE_URL}/videos/${video.id}`;
    const enUrl = `${BASE_URL}/en/videos/${video.id}`;

    return `  <url>
    <loc>${thUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="th" href="${thUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
  </url>
  <url>
    <loc>${enUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="th" href="${thUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

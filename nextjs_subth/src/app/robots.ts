import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default: อนุญาต search engines ทั้งหมด
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/member/", "/en/member/"],
      },
      // ป้องกัน Google AI training (Bard/Gemini)
      {
        userAgent: "Google-Extended",
        disallow: "/",
      },
      // ป้องกัน ChatGPT/OpenAI
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      // ป้องกัน Claude/Anthropic
      {
        userAgent: "ClaudeBot",
        disallow: "/",
      },
      // ป้องกัน Common Crawl (ใช้ train หลาย AI)
      {
        userAgent: "CCBot",
        disallow: "/",
      },
      // ป้องกัน ByteDance/TikTok AI
      {
        userAgent: "Bytespider",
        disallow: "/",
      },
    ],
    sitemap: "https://subth.com/sitemap.xml",
  };
}

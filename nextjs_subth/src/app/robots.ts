import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/member/"],
      },
    ],
    sitemap: "https://subth.com/sitemap.xml",
  };
}

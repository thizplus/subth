# Sitemap Restructuring Plan

## Current State

### Structure
```
/sitemap.xml (single file - 46 URLs)
```

### Issues
1. **Single file** - ยากต่อการ debug และ track ใน GSC
2. **Mixed content** - static + dynamic URLs รวมกัน
3. **Same revalidation** - ทุก content type ใช้ revalidate เดียวกัน (1hr)

---

## Proposed Structure

```
/sitemap.xml                    ← Sitemap Index (ชี้ไปยัง child sitemaps)
├── /sitemap/static.xml         ← Static pages (/, /about, /contact, etc.)
├── /sitemap/articles.xml       ← All published articles
├── /sitemap/casts.xml          ← Cast pages (with articles only)
├── /sitemap/tags.xml           ← Tag pages (with articles only)
└── /sitemap/makers.xml         ← Maker pages (with articles only)
```

---

## Implementation Details

### File Structure
```
src/app/
├── sitemap.ts                  ← Sitemap Index (เปลี่ยนเป็น index)
└── sitemap/
    ├── static/sitemap.xml/route.ts
    ├── articles/sitemap.xml/route.ts
    ├── casts/sitemap.xml/route.ts
    ├── tags/sitemap.xml/route.ts
    └── makers/sitemap.xml/route.ts
```

### 1. Sitemap Index (`/sitemap.xml`)

```typescript
// src/app/sitemap.ts
import type { MetadataRoute } from "next";

const BASE_URL = "https://subth.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/sitemap/static.xml`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/sitemap/articles.xml`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/sitemap/casts.xml`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/sitemap/tags.xml`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/sitemap/makers.xml`,
      lastModified: new Date(),
    },
  ];
}
```

### 2. Child Sitemaps (Route Handlers)

#### Static Sitemap
```typescript
// src/app/sitemap/static.xml/route.ts
import { NextResponse } from "next/server";

const BASE_URL = "https://subth.com";

export async function GET() {
  const now = new Date().toISOString();

  const urls = [
    // TH
    { loc: BASE_URL, priority: "1.0", changefreq: "daily" },
    { loc: `${BASE_URL}/articles`, priority: "0.9", changefreq: "daily" },
    { loc: `${BASE_URL}/casts`, priority: "0.8", changefreq: "weekly" },
    { loc: `${BASE_URL}/tags`, priority: "0.8", changefreq: "weekly" },
    { loc: `${BASE_URL}/makers`, priority: "0.8", changefreq: "weekly" },
    { loc: `${BASE_URL}/about`, priority: "0.5", changefreq: "monthly" },
    { loc: `${BASE_URL}/contact`, priority: "0.5", changefreq: "monthly" },
    // EN
    { loc: `${BASE_URL}/en`, priority: "0.9", changefreq: "daily" },
    { loc: `${BASE_URL}/en/articles`, priority: "0.8", changefreq: "daily" },
    { loc: `${BASE_URL}/en/casts`, priority: "0.7", changefreq: "weekly" },
    { loc: `${BASE_URL}/en/tags`, priority: "0.7", changefreq: "weekly" },
    { loc: `${BASE_URL}/en/makers`, priority: "0.7", changefreq: "weekly" },
    { loc: `${BASE_URL}/en/about`, priority: "0.4", changefreq: "monthly" },
    { loc: `${BASE_URL}/en/contact`, priority: "0.4", changefreq: "monthly" },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400", // 24hr
    },
  });
}
```

#### Articles Sitemap
```typescript
// src/app/sitemap/articles.xml/route.ts
import { NextResponse } from "next/server";

const BASE_URL = "https://subth.com";
const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  const articles = await fetchAllArticles();

  const urls = articles.flatMap((article) => [
    {
      loc: `${BASE_URL}/articles/${article.slug}`,
      lastmod: article.publishedAt,
      priority: "0.8",
    },
    {
      loc: `${BASE_URL}/en/articles/${article.slug}`,
      lastmod: article.publishedAt,
      priority: "0.7",
    },
  ]);

  const xml = generateSitemapXml(urls);

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600", // 1hr
    },
  });
}
```

---

## Revalidation Strategy

| Sitemap | Cache Duration | Reason |
|---------|---------------|--------|
| `static.xml` | 24 hours | Pages rarely change |
| `articles.xml` | 1 hour | New articles published frequently |
| `casts.xml` | 24 hours | Cast data rarely changes |
| `tags.xml` | 24 hours | Tags rarely change |
| `makers.xml` | 24 hours | Makers rarely change |

---

## robots.txt Update

```typescript
// src/app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/member/", "/en/member/", "/login"],
      },
    ],
    sitemap: [
      "https://subth.com/sitemap.xml",
      // หรือระบุแยก
      // "https://subth.com/sitemap/static.xml",
      // "https://subth.com/sitemap/articles.xml",
      // "https://subth.com/sitemap/casts.xml",
      // "https://subth.com/sitemap/tags.xml",
      // "https://subth.com/sitemap/makers.xml",
    ],
  };
}
```

---

## GSC Submission

หลัง deploy ให้ submit sitemaps ใน Google Search Console:

1. `/sitemap.xml` (index) - Google จะ discover child sitemaps เอง
2. หรือ submit แยกทีละอัน:
   - `/sitemap/static.xml`
   - `/sitemap/articles.xml`
   - `/sitemap/casts.xml`
   - `/sitemap/tags.xml`
   - `/sitemap/makers.xml`

---

## Benefits

1. **Better Tracking** - ดู indexing status แยกตาม content type
2. **Faster Updates** - articles revalidate บ่อย, static revalidate น้อย
3. **Easier Debugging** - เห็นปัญหาชัดเจนว่าอยู่ที่ sitemap ไหน
4. **Scalability** - รองรับ content เยอะได้ (แต่ละ sitemap max 50,000 URLs)
5. **SEO Best Practice** - Google แนะนำให้แยก sitemap ตาม content type

---

## Implementation Steps

1. [ ] สร้าง folder `src/app/sitemap/`
2. [ ] สร้าง route handlers สำหรับ child sitemaps
3. [ ] แก้ไข `src/app/sitemap.ts` เป็น sitemap index
4. [ ] Test locally: `npm run build && npm run start`
5. [ ] ตรวจสอบ URLs:
   - http://localhost:3000/sitemap.xml
   - http://localhost:3000/sitemap/articles.xml
   - etc.
6. [ ] Deploy to production
7. [ ] Submit to GSC

---

## Alternative: generateSitemaps (Next.js 14+)

Next.js 14+ รองรับ `generateSitemaps()` สำหรับแบ่ง sitemap เป็นหลายไฟล์:

```typescript
// src/app/sitemap.ts
export async function generateSitemaps() {
  return [{ id: "static" }, { id: "articles" }, { id: "casts" }];
}

export default async function sitemap({ id }: { id: string }) {
  if (id === "static") return staticUrls;
  if (id === "articles") return articleUrls;
  // ...
}
```

ผลลัพธ์: `/sitemap/0.xml`, `/sitemap/1.xml`, `/sitemap/2.xml`

**ข้อเสีย:** URL ไม่สื่อความหมาย (ใช้ตัวเลข)

---

*Last updated: 2026-02-26*

# SEO Crawl Budget Fix Report

วิเคราะห์จากปัญหาที่พบใน `_____FIX_PROBLEM.md` และตรวจสอบ codebase แล้ว

---

## สถานะปัจจุบัน

| Metric | ปัจจุบัน | เป้าหมาย |
|--------|----------|----------|
| HTML crawl % | 6% | 20-30% |
| Discovery | 2% | 10-20% |
| Image crawl | 45% | ลดลง |
| JS crawl | 35% | ลดลง |

---

## 1. robots.txt - ตรวจสอบแล้ว ✅

**ไฟล์:** `src/app/robots.ts`

### สถานะปัจจุบัน - OK
```typescript
disallow: ["/api/", "/member/", "/en/member/"]
```

### ⚠️ ข้อควรระวัง

**❌ ห้าม block `/_next/` หรือ `/_next/static/`**

เหตุผล:
- Google ต้อง crawl JS/CSS เพื่อ render หน้า
- ถ้า block → Google render ไม่ครบ → indexing มีปัญหา

**✅ ถ้าต้องการลด crawl budget สำหรับ Next.js:**
```typescript
disallow: [
  "/api/",
  "/member/",
  "/en/member/",
  "/_next/data/",    // ✅ OK - แค่ prefetch JSON (ไม่จำเป็นต่อ render)
]
```

### สรุป
| Path | Block? | เหตุผล |
|------|--------|--------|
| `/api/` | ✅ | API endpoints |
| `/member/` | ✅ | Private pages |
| `/_next/static/` | ❌ | CSS/JS จำเป็นต่อ render |
| `/_next/data/` | ✅ | Prefetch JSON ไม่จำเป็น |

---

## 2. WWW Redirect - ต้องเพิ่ม 🔴

**ไฟล์:** `next.config.ts`

### ปัญหา
- ไม่มี 301 redirect จาก `www.subth.com` → `subth.com`
- ทำให้ Google crawl 2 hosts แยกกัน (เสีย crawl budget)

### แก้ไข (แนะนำทำที่ Cloudflare)

**Cloudflare Page Rules:**
1. ไปที่ Rules → Page Rules
2. เพิ่ม `www.subth.com/*` → 301 Redirect → `https://subth.com/$1`

**หรือใน next.config.ts:**
```typescript
async redirects() {
  return [
    {
      source: "/:path*",
      has: [{ type: "host", value: "www.subth.com" }],
      destination: "https://subth.com/:path*",
      permanent: true,
    },
  ];
},
```

---

## 3. Sitemap Index - ต้องแก้ไข 🟡

**ไฟล์:** `src/app/sitemap.ts`

### ปัญหา
- Return format ไม่ใช่ Sitemap Index
- lastmod ใช้ `now` ทุกครั้ง (ควร update เฉพาะ URL ที่แก้จริง)

### แก้ไข - เปลี่ยนเป็น Route Handler

**ลบไฟล์:** `src/app/sitemap.ts`

**สร้างไฟล์ใหม่:** `src/app/sitemap.xml/route.ts`

```typescript
import { NextResponse } from "next/server";

const BASE_URL = "https://subth.com";

export async function GET() {
  // ดึง lastmod จริงจาก API หรือ DB
  const sitemaps = [
    { loc: `${BASE_URL}/sitemap/static.xml`, lastmod: "2026-02-28" },
    { loc: `${BASE_URL}/sitemap/articles.xml`, lastmod: "2026-02-28" }, // ควรดึงจาก latest article
    { loc: `${BASE_URL}/sitemap/casts.xml`, lastmod: "2026-02-20" },
    { loc: `${BASE_URL}/sitemap/tags.xml`, lastmod: "2026-02-15" },
    { loc: `${BASE_URL}/sitemap/makers.xml`, lastmod: "2026-02-10" },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (s) => `  <sitemap>
    <loc>${s.loc}</loc>
    <lastmod>${s.lastmod}</lastmod>
  </sitemap>`
  )
  .join("\n")}
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
```

### ⚠️ Child Sitemap Rules

1. **articles.xml ไม่เกิน 50,000 URLs** - ถ้าเกินต้องแยกเป็น `articles-1.xml`, `articles-2.xml`
2. **lastmod ต้อง update เฉพาะ URL ที่แก้จริง** - ไม่ใช่ใส่ `now` ทุกครั้ง
3. **เพิ่ม priority ใน child sitemap** (อยู่ใน articles.xml แล้ว ✅)

---

## 4. CDN (files.subth.com) - ต้องทำที่ R2/Cloudflare 🔴

### ปัญหา
- CDN ไม่มี robots.txt → Google crawl รูปเยอะ (45%)

### แก้ไข (Cloudflare Workers - แนะนำ)

```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/robots.txt") {
      return new Response("User-agent: *\nDisallow: /", {
        headers: { "Content-Type": "text/plain" },
      });
    }

    return fetch(request);
  },
};
```

---

## 5. Homepage Discovery - ✅ DONE

**ไฟล์:** `src/app/page.tsx`, `src/app/en/page.tsx`

### ปัญหา
- แสดงแค่ 12 articles
- ไม่มี "Latest Updated" section
- ไม่มี link ไปหน้า Category

### แก้ไขแล้ว

#### 5.1 เพิ่ม "Latest Updated" Section ✅

**Implementation:**

1. **Backend** - เพิ่ม sort parameter (`gofiber_subth`):
   - `dto/article.go`: เพิ่ม Sort, Order fields
   - `repositories/article_repository.go`: เพิ่ม Sort, Order
   - `postgres/article_repository_impl.go`: dynamic ORDER BY
   - `serviceimpl/article_service_impl.go`: pass params ไป repository

2. **Frontend** - เพิ่ม UI section:
   - `features/article/types.ts`: เพิ่ม sort, order params
   - `features/article/service.ts`: ส่ง sort, order ไป API
   - `src/app/page.tsx`: fetch updatedArticles + render section
   - `src/app/en/page.tsx`: same for EN

**API:**
```
GET /api/v1/articles/public?sort=updated_at&order=desc&limit=8
```

#### 5.3 เพิ่ม Category Quick Links
```tsx
<section className="mb-10">
  <h2 className="mb-4 text-xl font-semibold">หมวดหมู่ยอดนิยม</h2>
  <div className="flex flex-wrap gap-3">
    <Link href="/casts">นักแสดง ({castCount})</Link>
    <Link href="/makers">ค่าย ({makerCount})</Link>
    <Link href="/tags">แท็ก ({tagCount})</Link>
  </div>
</section>
```

---

## 6. เร่ง Index หลัง Publish 🔥

### ⚠️ Google Indexing API - ใช้ไม่ได้กับ Article

**Indexing API รองรับเฉพาะ:**
- JobPosting
- BroadcastEvent
- Livestream

**ถ้าใช้กับ article → Google อาจ ignore**

### ✅ วิธีที่ได้ผลจริง

#### 6.1 Internal Link จาก Homepage (ภายใน 1 นาที) ✅ DONE

**หลัง publish article ใหม่:**
1. Homepage ต้อง list article ใหม่ทันที
2. ถ้า cache → invalidate cache ทันที

**Implementation (gofiber_subth):**

**1. เพิ่ม DeleteByPattern ใน Redis client:**
```go
// infrastructure/redis/redis.go
func (r *RedisClient) DeleteByPattern(ctx context.Context, pattern string) (int64, error)
```

**2. เพิ่ม Pattern keys ใน cache/keys.go:**
```go
func ArticleListPattern() string              // article:list:*
func ArticleByCastPattern(slug string) string // article:cast:{slug}:*
func ArticleByTagPattern(slug string) string  // article:tag:{slug}:*
func ArticleByMakerPattern(slug string) string // article:maker:{slug}:*
```

**3. เพิ่ม invalidateRelatedCaches helper ใน article_service_impl.go:**
- Invalidate article detail cache
- Invalidate all article list pages
- Invalidate cast pages (ดึง casts จาก video relations)
- Invalidate tag pages (ดึง tags จาก video relations)
- Invalidate maker pages (ดึง maker จาก video relations)

**4. เรียก helper method ใน:**
- `UpdateStatus()` - เมื่อ status = published
- `PublishScheduledArticles()` - เมื่อ scheduled article published
- `IngestArticle()` - เมื่อ update existing published article

#### 6.2 Ping Sitemap

```go
func PingGoogleSitemap() error {
    sitemapURL := url.QueryEscape("https://subth.com/sitemap.xml")
    _, err := http.Get("https://www.google.com/ping?sitemap=" + sitemapURL)
    return err
}
```

#### 6.3 แชร์ผ่าน Twitter/X

Google crawl social link เร็ว → แชร์ทันทีหลัง publish

---

## 7. Pagination Crawl Control 🔴 สำคัญมาก!

### ปัญหา

ถ้าเว็บมี:
```
/articles/page/1
/articles/page/2
...
/articles/page/50
```

Google จะ crawl ลึกเรื่อยๆ → **เสีย crawl budget ไป pagination**

### สถานะปัจจุบัน

**Pagination pages ที่ต้องแก้ (public):**
- `/articles/page/[page]`
- `/casts/page/[page]`
- `/casts/[slug]/page/[page]`
- `/makers/page/[page]`
- `/makers/[slug]/page/[page]`
- `/tags/page/[page]`
- `/tags/[slug]/page/[page]`
- และ `/en/` versions ทั้งหมด

**PaginationHead component:**
- มีแค่ `rel="prev/next"` ✅
- **ไม่มี `noindex` สำหรับ page > 5** ❌

### แก้ไข - Option 1: noindex page > 5 (แนะนำ)

**แก้ไข `generateMetadata` ในทุก pagination page:**

```typescript
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await params;
  const currentPage = parseInt(page || "1", 10);

  // 🔥 page > 5 → noindex, follow
  const shouldIndex = currentPage <= 5;

  return {
    title: currentPage === 1
      ? "บทความทั้งหมด | SubTH"
      : `บทความทั้งหมด - หน้า ${currentPage} | SubTH`,
    description: "รวมบทความรีวิววิดีโอซับไทยทั้งหมด",

    // 🔥 เพิ่มส่วนนี้
    robots: {
      index: shouldIndex,
      follow: true,  // ให้ follow links เสมอ
    },

    alternates: {
      canonical: currentPage === 1
        ? `${BASE_URL}/articles`
        : `${BASE_URL}/articles/page/${currentPage}`,
    },
  };
}
```

### แก้ไข - Option 2: Canonical ไป page 1 (ถ้าไม่อยากให้ rank)

```typescript
alternates: {
  canonical: `${BASE_URL}/articles`,  // ทุก page ชี้ไป page 1
},
```

### แก้ไข - Option 3: Limit Pagination Depth

**ใน Pagination component:**
```typescript
// แสดง pagination แค่ 10 หน้าแรก
const maxVisiblePages = Math.min(totalPages, 10);
```

**ใน sitemap:**
```typescript
// ไม่ใส่ page > 5 ใน sitemap
const pagesToInclude = Math.min(totalPages, 5);
```

### สรุป Pagination Strategy

| Page | Index? | Canonical | ใน Sitemap? |
|------|--------|-----------|-------------|
| 1 | ✅ | self | ✅ |
| 2-5 | ✅ | self | ✅ |
| 6+ | ❌ noindex | self หรือ page 1 | ❌ |

---

## 8. Canonical/Hreflang Audit (TH/EN) ✅

### สถานะปัจจุบัน - OK

**TH page (`/articles/review/${slug}`):**
```typescript
alternates: {
  canonical: `https://subth.com/articles/review/${slug}`,  // ✅ ชี้ไป TH
  languages: {
    th: `https://subth.com/articles/review/${slug}`,
    en: `https://subth.com/en/articles/review/${slug}`,
  },
}
```

**EN page (`/en/articles/review/${slug}`):**
```typescript
alternates: {
  canonical: `https://subth.com/en/articles/review/${slug}`,  // ✅ ชี้ไป EN
  languages: {
    th: `https://subth.com/articles/review/${slug}`,
    en: `https://subth.com/en/articles/review/${slug}`,
  },
}
```

### สรุป
- TH canonical → TH ✅
- EN canonical → EN ✅
- hreflang cross reference ✅

---

## 9. Internal Link Density หลัง Publish ✅ DONE

### ปัญหา
หลัง publish article ใหม่:
- Homepage อาจยังไม่มี link (cache)
- Cast page ไม่มี link ไป article ใหม่
- Tag page ไม่มี link ไป article ใหม่
- Maker page ไม่มี link ไป article ใหม่

**Internal links เพิ่ม discovery มากกว่า sitemap 5 เท่า!**

### แก้ไขแล้ว - Backend (gofiber_subth)

**Implementation:**

1. **Redis client** (`infrastructure/redis/redis.go`):
   - เพิ่ม `DeleteByPattern()` ใช้ SCAN + DEL (ปลอดภัย ไม่ block)

2. **Cache keys** (`pkg/cache/keys.go`):
   - เพิ่ม pattern functions สำหรับ wildcard delete

3. **Article service** (`application/serviceimpl/article_service_impl.go`):
   - เพิ่ม `invalidateRelatedCaches()` helper method
   - เรียกใน `UpdateStatus()`, `PublishScheduledArticles()`, `IngestArticle()`

### ผลลัพธ์
- Article ใหม่จะมี internal links จากหลาย pages ทันที
- Google discover ผ่าน cast/tag/maker pages
- เพิ่ม crawl priority โดยอัตโนมัติ

---

## 10. Crawl Priority Signaling (Sitemap) ✅

### สถานะปัจจุบัน - OK

**ใน `articles.xml`:**
```typescript
{ loc: "/articles/review/xxx", priority: "0.8" }  // TH ✅
{ loc: "/en/articles/review/xxx", priority: "0.7" }  // EN ✅
```

### แนะนำเพิ่มเติม

**ใน `casts.xml`, `tags.xml`, `makers.xml`:**
```typescript
priority: "0.6"  // Category pages
```

**ใน `static.xml`:**
```typescript
{ loc: "/", priority: "1.0" }
{ loc: "/articles", priority: "0.9" }
{ loc: "/about", priority: "0.5" }
{ loc: "/privacy-policy", priority: "0.3" }
```

---

## 11. Image Crawl Optimization 🟡

### ปัญหา
Image crawl 45% ยังสูง แม้จะ block CDN robots.txt

### แก้ไข - เพิ่ม Cache-Control Header

**ที่ Cloudflare/R2:**
```
Cache-Control: public, max-age=31536000, immutable
```

**Cloudflare Page Rules:**
1. Match: `files.subth.com/*`
2. Cache Level: Cache Everything
3. Edge Cache TTL: 1 year
4. Browser Cache TTL: 1 year

**หรือ Cloudflare Workers:**
```javascript
export default {
  async fetch(request) {
    const response = await fetch(request);
    const newResponse = new Response(response.body, response);

    // เพิ่ม immutable cache
    newResponse.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );

    return newResponse;
  },
};
```

### ผลลัพธ์
- Google จะลด re-crawl รูปเดิม
- ลด image crawl % ลงอีก

---

### ไฟล์ที่ต้องแก้ (22 ไฟล์)

**Thai:**
- `src/app/(public)/articles/page/[page]/page.tsx`
- `src/app/(public)/casts/page/[page]/page.tsx`
- `src/app/(public)/casts/[slug]/page/[page]/page.tsx`
- `src/app/(public)/makers/page/[page]/page.tsx`
- `src/app/(public)/makers/[slug]/page/[page]/page.tsx`
- `src/app/(public)/tags/page/[page]/page.tsx`
- `src/app/(public)/tags/[slug]/page/[page]/page.tsx`

**English (เหมือนกัน ใน `/en/`):**
- `src/app/en/(public)/articles/page/[page]/page.tsx`
- `src/app/en/(public)/casts/page/[page]/page.tsx`
- ... (อีก 5 ไฟล์)

**หมายเหตุ:** `/member/` pages อยู่ใน robots.txt disallow แล้ว ไม่ต้องแก้

---

## สรุป Priority

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| 🔴 HIGH | **Pagination noindex page > 5** | 1 ชม. | สูงมาก |
| 🔴 HIGH | **Internal Link Invalidation หลัง publish** | 30 นาที | สูงมาก |
| 🔴 HIGH | www → non-www redirect (Cloudflare) | 5 นาที | สูง |
| 🔴 HIGH | CDN robots.txt | 15 นาที | สูง |
| 🔴 HIGH | เพิ่ม "Latest Updated" section ใน Homepage | 30 นาที | สูง |
| 🟡 MED | แก้ sitemap.xml → sitemap index | 15 นาที | ปานกลาง |
| 🟡 MED | แก้ lastmod ใน sitemap (ใช้ค่าจริง) | 30 นาที | ปานกลาง |
| 🟡 MED | Image Cache-Control: immutable | 15 นาที | ปานกลาง |
| 🟡 MED | Sitemap ping หลัง publish | 30 นาที | ปานกลาง |
| 🟢 LOW | เพิ่ม Category quick links | 15 นาที | ต่ำ |

---

## Checklist

### 🔴 Critical (ทำก่อน)
- [x] **Pagination: เพิ่ม `noindex` สำหรับ page > 5** (14 ไฟล์ public) ✅
- [x] **Internal Link: Invalidate cache หลัง publish** (homepage, cast, tag, maker) ✅
- [ ] เพิ่ม www → non-www redirect (Cloudflare)
- [ ] เพิ่ม robots.txt ที่ files.subth.com (R2/Cloudflare)
- [x] เพิ่ม "Latest Updated" section ใน Homepage ✅ (TH + EN)

### 🟡 Medium
- [x] สร้าง `sitemap.xml/route.ts` แทน `sitemap.ts` ✅
- [ ] แก้ lastmod ใน sitemap ให้ใช้ค่าจริง (ไม่ใช่ `now`)
- [ ] เพิ่ม Cache-Control: immutable สำหรับ images (Cloudflare)
- [ ] Sitemap ping หลัง publish

### 🟢 Nice to have
- [ ] เพิ่มจำนวน articles ใน homepage (12 → 20)
- [ ] เพิ่ม Category quick links ใน homepage
- [ ] เพิ่ม priority ใน casts/tags/makers sitemap

### ✅ Already OK
- [x] Canonical/Hreflang (TH/EN cross reference)
- [x] Sitemap priority สำหรับ articles

---

*Updated: 2026-03-01*

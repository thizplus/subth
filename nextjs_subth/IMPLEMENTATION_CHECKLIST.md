# Frontend Implementation Checklist

> Checklist สำหรับติดตามความคืบหน้าการพัฒนา Frontend ของ SubTH
> อ้างอิงจาก: `_seo_worker/FRONTEND_IMPLEMENTATION_PLAN.md`

---

## 1. Public Article Page Components (Section 7.1)

### Core Components
- [x] `ThumbnailWithCTA` - Thumbnail + Play overlay → redirect login
- [x] `KeyMomentsPreview` - Progress bar แสดง moments
- [x] `CastCard` - แสดง cast profile + bio
- [x] `MakerCard` - แสดง maker info
- [x] `TagsList` - Tags with links
- [x] `QuoteCard` - แสดง topQuotes with timestamp
- [x] `ExpertBox` - Expert analysis box
- [x] `FAQAccordion` - Collapsible FAQ
- [x] `GallerySection` - Gallery images (lazy load)
- [x] `TechnicalSpecs` - Video/Audio quality info
- [ ] `QualityScore` - Star rating display (ถ้าต้องการ)
- [ ] `RelatedVideos` - Grid of related content
- [ ] `LoginCTABanner` - Banner ชักชวน login

### Chunk 4: Deep Analysis Components
- [x] `CharacterJourneySection` - พัฒนาการตัวละคร + Emotional Arc
- [x] `CinematographySection` - วิเคราะห์งานภาพ
- [x] `EducationalSection` - บริบทเชิงลึก (thematic, cultural, comparison)
- [x] `ViewingTipsSection` - คำแนะนำการรับชม

### Navigation & UX
- [x] `TableOfContents` - TOC แบบ collapsible (native anchor links)
- [x] `ScrollToTop` - ปุ่มกลับด้านบน
- [x] Sticky header with proper scroll-margin

---

## 2. Schema.org Components (Section 7.2)

- [x] `VideoObjectSchema` - JSON-LD for video (`isAccessibleForFree: false`)
- [x] `FAQPageSchema` - JSON-LD for FAQ
- [x] `ArticleSchema` - JSON-LD for article with WatchAction
- [x] `BreadcrumbSchema` - JSON-LD for breadcrumbs

---

## 3. Public Pages - SEO Pillar Pages (Section 12)

### Articles
- [x] `/articles/[slug]` - Article detail page
- [x] `/articles` - Articles listing page (index) ✅ 2026-02-24

### Casts (Pillar Pages)
- [x] `/casts` - รายการนักแสดงทั้งหมด ✅ 2026-02-24
- [x] `/casts/[slug]` - หน้านักแสดง + รายการบทความ ✅ 2026-02-24

### Tags
- [x] `/tags` - รายการ Tags ทั้งหมด ✅ 2026-02-24
- [x] `/tags/[slug]` - หน้า Tag + รายการบทความ ✅ 2026-02-24

### Makers
- [ ] `/makers` - รายการค่ายทั้งหมด
- [ ] `/makers/[slug]` - หน้าค่าย + รายการบทความ

### Categories
- [ ] `/categories` - รายการหมวดหมู่ทั้งหมด
- [ ] `/categories/[slug]` - หน้าหมวดหมู่ + รายการบทความ

---

## 4. Sidebar Navigation

### Current Menu (Updated 2026-02-24)
- [x] ฟีด (Home `/`)
- [x] บทความ (`/articles`) ✅
- [x] Reels (`/reels`)
- [x] นักแสดง (`/casts`) ✅
- [x] Member link (for authenticated users)

### Hidden from Menu
- Tags (`/tags`) - ซ่อนเพราะมี 18+ content
- Makers (`/makers`) - ยังไม่ได้สร้าง

---

## 5. Image Safety & Gallery (Section 14)

### Backend (Implemented)
- [x] Three-Tier Classification (super_safe/safe/nsfw)
- [x] `_worker`: classify_batch.py + gallery_handler.go
- [x] `_seo_worker`: prioritizes super_safe folder
- [x] Database: gallery_super_safe_count column

### Frontend
- [x] GallerySection - แสดง super_safe images
- [ ] Member Gallery Unlock CTA - "ภาพเบื้องหลังอีก X รูป"
- [ ] MemberGallerySection - แสดง safe/nsfw สำหรับ member

---

## 6. Internal Linking (Section 4)

- [ ] Auto-link cast names ในเนื้อหาไปหน้า `/casts/[slug]`
- [ ] Auto-link tag names ไปหน้า `/tags/[slug]`
- [ ] Auto-link maker names ไปหน้า `/makers/[slug]`
- [x] `ContextualLinks` component - แสดง related links

---

## 7. Member Video Page (Section 7.1.1)

- [x] `/member/videos/[id]` - Video player page
- [x] HLS Video Player
- [x] Auto-seek from URL param `?t=`
- [x] Auth guard (redirect if not logged in)

---

## 8. Meta Tags & SEO (Section 6)

- [x] Dynamic meta title/description
- [x] Open Graph tags
- [x] Twitter Card tags
- [x] Canonical URL
- [ ] Sitemap generation for articles
- [ ] robots.txt configuration

---

## 9. Performance (Section 8)

- [x] Lazy loading for gallery images
- [x] Priority loading for thumbnail
- [x] WebP format support (via Next.js Image)
- [ ] Core Web Vitals optimization (LCP < 2.5s)
- [ ] Code splitting for components

---

## 10. Analytics & Tracking (Section 8.3)

- [ ] Key Moment clicks tracking
- [ ] CTA Button clicks tracking
- [ ] Scroll depth tracking
- [ ] Conversion funnel tracking

---

## 11. English Version (`/en`)

- [x] `/en` - English home page
- [x] `/en/reels` - English reels
- [x] `/en/member/*` - English member pages
- [ ] `/en/articles/[slug]` - English article detail
- [ ] `/en/articles` - English articles listing
- [ ] `/en/casts`, `/en/tags`, `/en/makers` - English pillar pages

---

## Priority Order (แนะนำ)

### Phase 1: SEO Foundation (High Priority) ✅ COMPLETED 2026-02-24
1. [x] `/articles` - Articles listing page ✅
2. [x] `/casts` + `/casts/[slug]` - Cast pillar pages ✅
3. [x] `/tags` + `/tags/[slug]` - Tag pillar pages ✅
4. [x] Update sidebar menu ✅

### Phase 2: Complete SEO Structure
5. [ ] `/makers` + `/makers/[slug]` - Maker pillar pages
6. [ ] `/categories` + `/categories/[slug]` - Category pages
7. [ ] Sitemap generation
8. [ ] English versions

### Phase 3: Conversion Optimization
9. [ ] Member Gallery Unlock CTA
10. [ ] LoginCTABanner
11. [ ] RelatedVideos component
12. [ ] Analytics tracking

### Phase 4: Performance & Polish
13. [ ] Core Web Vitals optimization
14. [ ] Auto-linking in content
15. [ ] QualityScore component

---

## API Dependencies

สำหรับหน้า public ใหม่ ต้องมี API endpoints ใน **gofiber_subth**:

### Required Backend Endpoints

| Endpoint | Purpose | Status | Priority |
|----------|---------|--------|----------|
| `GET /api/v1/articles/public` | List published articles | ✅ เสร็จแล้ว | **HIGH** |
| `GET /api/v1/articles/cast/:slug` | Articles by cast | ✅ เสร็จแล้ว | **HIGH** |
| `GET /api/v1/articles/tag/:slug` | Articles by tag | ✅ เสร็จแล้ว | MEDIUM |
| `GET /api/v1/articles/maker/:slug` | Articles by maker | ✅ เสร็จแล้ว | MEDIUM |

### Existing Endpoints (OK)
| Endpoint | Purpose | Status |
|----------|---------|--------|
| `GET /api/v1/articles/slug/:slug` | Get single article | ✅ มีแล้ว |
| `GET /api/v1/casts` | List all casts | ✅ มีแล้ว |
| `GET /api/v1/tags` | List all tags | ✅ มีแล้ว |
| `GET /api/v1/makers` | List all makers | ✅ มีแล้ว |

### Backend Implementation Notes

**`GET /api/v1/articles`** should return:
```json
{
  "success": true,
  "data": [
    {
      "slug": "utywgage",
      "title": "DLDSS-471: ...",
      "metaDescription": "...",
      "thumbnailUrl": "https://...",
      "videoCode": "DLDSS-471",
      "publishedAt": "2026-02-24T...",
      "castNames": ["Zemba Mami"],
      "makerName": "DAHLIA",
      "tags": ["Drama", "Medical"]
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 24,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Query params:**
- `page` (int) - Page number
- `limit` (int) - Items per page
- `lang` (string) - Language (th/en)
- `search` (string) - Search query

> **Note**: ✅ Frontend routes, service, และ Backend API เสร็จสมบูรณ์แล้ว (2026-02-24)

---

*Last Updated: 2026-02-24*
*Phase 1 Completed: 2026-02-24*

---

## Changelog

### 2026-02-24
**Frontend Pages:**
- ✅ Created `/articles` listing page with error handling
- ✅ Created `/articles/page/[page]` pagination
- ✅ Created `/casts` listing page
- ✅ Created `/casts/page/[page]` pagination
- ✅ Created `/casts/[slug]` detail page with articles
- ✅ Created `/casts/[slug]/page/[page]` pagination
- ✅ Created `/tags` listing page (เปลี่ยนชื่อเป็น "แท็ก")
- ✅ Created `/tags/page/[page]` pagination
- ✅ Created `/tags/[slug]` detail page with articles
- ✅ Created `/tags/[slug]/page/[page]` pagination

**Components & Services:**
- ✅ Added `ArticleCard` component for listings
- ✅ Updated `articleService` with list methods (getList, getByCast, getByTag, getByMaker)
- ✅ Added API routes constants for articles listing

**Sidebar Menu:**
- ✅ Added: ฟีด, บทความ, Reels, นักแสดง
- ✅ Hidden: แท็ก (18+ content)

**Backend API (Completed 2026-02-24):**
- ✅ `GET /api/v1/articles/public` - List published articles
- ✅ `GET /api/v1/articles/cast/:slug` - Articles by cast
- ✅ `GET /api/v1/articles/tag/:slug` - Articles by tag
- ✅ `GET /api/v1/articles/maker/:slug` - Articles by maker

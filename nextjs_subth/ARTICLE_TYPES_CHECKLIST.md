# Article Types Migration Checklist

## สรุปการเปลี่ยนแปลง

**URL เดิม:** `/articles/dass-541`
**URL ใหม่:** `/articles/review/dass-541`

**Article Types ที่รองรับ:**
| Type | URL Pattern | ตัวอย่าง |
|------|-------------|----------|
| `review` | `/articles/review/[slug]` | รีวิวรายหนัง (ปัจจุบัน) |
| `ranking` | `/articles/ranking/[slug]` | Top 10 lists |
| `best-of` | `/articles/best-of/[slug]` | Best of [Cast/Maker] |
| `guide` | `/articles/guide/[slug]` | Ultimate Guide to [Tag] |
| `news` | `/articles/news/[slug]` | ข่าวสาร/อัพเดท |

---

## 1. Backend (gofiber_subth)

### 1.1 Database Migration
- [ ] เพิ่ม `type` column ใน `articles` table
  ```sql
  -- สร้าง enum type
  CREATE TYPE article_type AS ENUM ('review', 'ranking', 'best-of', 'guide', 'news');

  -- เพิ่ม column
  ALTER TABLE articles ADD COLUMN type article_type DEFAULT 'review';

  -- Update 4 บทความเดิมให้เป็น review
  UPDATE articles SET type = 'review' WHERE type IS NULL;
  ```

### 1.2 Models
- [ ] `domain/models/article.go` - เพิ่ม `Type` field
  ```go
  type Article struct {
      // ... existing fields
      Type string `json:"type" gorm:"type:article_type;default:'review'"`
  }
  ```

### 1.3 DTOs
- [ ] `domain/dto/article.go` - เพิ่ม Type ใน request/response
  ```go
  type ArticleResponse struct {
      // ... existing fields
      Type string `json:"type"`
  }
  ```

### 1.4 API Endpoints
- [ ] `GET /api/v1/articles` - รองรับ filter by type `?type=review`
- [ ] `GET /api/v1/articles/:type/:slug` - endpoint ใหม่ (optional)
- [ ] Sitemap - generate URLs ตาม type

### 1.5 Mappers
- [ ] `domain/dto/mappers.go` - map Type field

---

## 2. Frontend (nextjs_subth)

### 2.1 Route Structure
- [ ] สร้าง `/articles/review/[slug]/page.tsx` (ย้ายจาก `/articles/[slug]`)
- [ ] สร้าง `/articles/ranking/[slug]/page.tsx`
- [ ] สร้าง `/articles/best-of/[slug]/page.tsx`
- [ ] สร้าง `/articles/guide/[slug]/page.tsx`
- [ ] สร้าง `/articles/news/[slug]/page.tsx`
- [ ] เหมือนกันสำหรับ `/en/articles/...`

### 2.2 Redirects (4 บทความเดิม)
- [ ] `next.config.js` - redirect URLs เก่าไปใหม่
  ```js
  async redirects() {
    return [
      {
        source: '/articles/:slug',
        destination: '/articles/review/:slug',
        permanent: true, // 301
      },
      {
        source: '/en/articles/:slug',
        destination: '/en/articles/review/:slug',
        permanent: true,
      },
    ]
  }
  ```

### 2.3 List Pages
- [ ] `/articles/page.tsx` - แสดงทุก type หรือ filter by type
- [ ] `/articles/review/page.tsx` - list เฉพาะ reviews (optional)
- [ ] `/articles/ranking/page.tsx` - list เฉพาะ rankings

### 2.4 Components (สำหรับ article types ใหม่)
- [ ] `RankingList` - numbered list with images
- [ ] `ComparisonTable` - ตารางเปรียบเทียบ
- [ ] `BestOfHero` - hero section สำหรับ best-of

### 2.5 Types
- [ ] `features/article/types.ts` - เพิ่ม ArticleType
  ```typescript
  export type ArticleType = 'review' | 'ranking' | 'best-of' | 'guide' | 'news';

  export interface Article {
    // ... existing fields
    type: ArticleType;
  }
  ```

### 2.6 Service
- [ ] `features/article/service.ts` - update API calls
  ```typescript
  getBySlug: (type: string, slug: string, locale?: string) =>
    fetch(`/api/v1/articles/${type}/${slug}?lang=${locale}`)
  ```

### 2.7 Internal Links
- [ ] Update ทุกที่ที่ link ไป articles ให้รวม type
- [ ] Breadcrumb - แสดง type เป็น level
- [ ] Related Articles - link ถูกต้อง

### 2.8 Sitemap
- [ ] `app/sitemap.ts` - generate URLs with type prefix

### 2.9 Schema Updates
- [ ] `ArticleSchema` - update canonical URL
- [ ] `BreadcrumbSchema` - เพิ่ม type level

---

## 3. SEO Worker (_seo_worker)

### 3.1 Article Generation
- [ ] เพิ่ม `type` field ใน output
- [ ] Generate slug ที่รวม type (หรือแยก field)

### 3.2 URL Generation
- [ ] Update URLs ใน content ให้ใช้ format ใหม่
  ```go
  // เดิม
  url := fmt.Sprintf("/articles/%s", slug)
  // ใหม่
  url := fmt.Sprintf("/articles/%s/%s", articleType, slug)
  ```

### 3.3 New Prompts (Phase 2)
- [ ] Prompt สำหรับ `ranking` type
- [ ] Prompt สำหรับ `best-of` type
- [ ] Prompt สำหรับ `guide` type

### 3.4 Content Structure (Phase 2)
- [ ] JSON structure สำหรับ ranking items
  ```json
  {
    "type": "ranking",
    "items": [
      { "rank": 1, "videoCode": "XXX", "reason": "..." }
    ]
  }
  ```

---

## 4. Testing

### 4.1 URLs
- [ ] `/articles/review/dass-541` - ทำงานถูกต้อง
- [ ] `/articles/dass-541` - redirect ไป review
- [ ] `/en/articles/review/dass-541` - EN version
- [ ] 404 page - แสดงถูกต้อง

### 4.2 SEO
- [ ] Canonical URLs ถูกต้อง
- [ ] Schema.org URLs ถูกต้อง
- [ ] Sitemap URLs ถูกต้อง
- [ ] Internal links ถูกต้อง

### 4.3 Google Search Console
- [ ] Submit sitemap ใหม่
- [ ] ตรวจสอบ redirect ทำงาน
- [ ] Request re-index 4 บทความเดิม

---

## 5. Migration Steps (ลำดับการทำ)

### Phase 1: Backend + DB (ทำก่อน)
1. [ ] Run database migration (เพิ่ม type column)
2. [ ] Update Go models + DTOs
3. [ ] Update API endpoints
4. [ ] Deploy backend

### Phase 2: Frontend Routes
5. [ ] สร้าง route structure ใหม่
6. [ ] ย้าย article detail page
7. [ ] เพิ่ม redirects
8. [ ] Update types + service
9. [ ] Build + test locally

### Phase 3: Links & SEO
10. [ ] Update internal links
11. [ ] Update schemas
12. [ ] Update sitemap
13. [ ] Deploy frontend

### Phase 4: Verification
14. [ ] Test all URLs
15. [ ] Submit to Search Console
16. [ ] Monitor for errors

### Phase 5: New Article Types (อนาคต)
17. [ ] สร้าง ranking template
18. [ ] สร้าง best-of template
19. [ ] Update SEO Worker prompts
20. [ ] Generate new content

---

## 6. Rollback Plan

หากมีปัญหา:
1. Revert frontend deployment
2. Remove redirects
3. บทความเดิมยังใช้ `/articles/[slug]` ได้

---

*Created: 2026-02-27*

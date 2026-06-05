# Article Feature Implementation Plan

## Overview
ระบบบทความอัตโนมัติ สร้างจาก SEO Worker และแสดงบนเว็บไซต์ subth.com

---

## Changelog

### 2026-02-23: Rename seo_articles → articles
- **เปลี่ยนชื่อ**: จาก `seo_articles` เป็น `articles` ทั้งหมด
- **เพิ่ม Type field**: รองรับหลายประเภท (`seo`, `news`, `review`)
- **API Endpoints**: `/api/v1/articles/*`
- **สาเหตุ**: เพื่อความ consistent และรองรับขยายในอนาคต

---

## Progress Tracking

### Phase 1: Backend Foundation ✅ COMPLETED

| Task | Status | Files (gofiber_subth/) |
|------|--------|------------------------|
| Model + Migration | ✅ | `domain/models/article.go` |
| DTOs (Request/Response) | ✅ | `domain/dto/article.go` |
| Repository Interface | ✅ | `domain/repositories/article_repository.go` |
| Repository Implementation | ✅ | `infrastructure/postgres/article_repository_impl.go` |
| Service Interface | ✅ | `domain/services/article_service.go` |
| Service Implementation | ✅ | `application/serviceimpl/article_service_impl.go` |
| Handler | ✅ | `interfaces/api/handlers/article_handler.go` |
| Routes | ✅ | `interfaces/api/routes/article_routes.go` |
| DI Container | ✅ | `pkg/di/container.go` |
| Database Migration | ✅ | `infrastructure/postgres/database.go` (AutoMigrate) |

### Phase 2: SEO Worker Integration ✅ COMPLETED

| Task | Status | Files (_seo_worker/) |
|------|--------|----------------------|
| ArticleContent Model | ✅ | `domain/models/article.go` |
| ArticlePublisherPort | ✅ | `domain/ports/publisher_port.go` |
| ArticlePublisher Implementation | ✅ | `infrastructure/publisher/article_publisher.go` |
| ImageCopierPort | ✅ | `domain/ports/image_copier_port.go` |
| ImageCopier Implementation | ✅ | `infrastructure/imagecopier/image_copier.go` |
| Wire ImageCopier to Container | ✅ | `container/container.go` |
| Enable Publishing in Handler | ✅ | `use_cases/seo_handler.go` |
| End-to-End Test | ✅ | Tested with video `utywgage` |

### Phase 3: Admin Frontend (vite_subth) ✅ COMPLETED

| Task | Status | Files (src/features/article/) |
|------|--------|-------------------------------|
| Types | ✅ | `types.ts` |
| Service | ✅ | `service.ts` |
| Hooks | ✅ | `hooks.ts` |
| ArticleListPage | ✅ | `pages/ArticleListPage.tsx` |
| Barrel Export | ✅ | `index.ts` |
| Routes | ✅ | `routes/index.tsx` |
| Sidebar Link | ✅ | `constants/sidebar-data.ts` |
| API Routes Constant | ✅ | `constants/api-routes.ts` |

### Phase 4: Customer Frontend (nextjs_subth) ⏳ PENDING

| Task | Status | Files |
|------|--------|-------|
| Article Service | ⏳ | `features/article/service.ts` |
| Article Page | ⏳ | `app/(main)/articles/[slug]/page.tsx` |
| SEO/Metadata | ⏳ | Component level |

### Phase 5: Advanced Features ⏳ PENDING

| Task | Status | Notes |
|------|--------|-------|
| Google Indexing API | ⏳ | Submit URL หลัง publish |
| Scheduler Job | ⏳ | Auto-publish scheduled articles |
| View Counter | ⏳ | Track article views |

---

## Database Schema

```sql
-- articles table (PostgreSQL)
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL UNIQUE,
    type VARCHAR(20) DEFAULT 'seo',
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    meta_title VARCHAR(100) NOT NULL,
    meta_description VARCHAR(250) NOT NULL,
    content JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',
    indexing_status VARCHAR(20) DEFAULT 'pending',
    quality_score INTEGER DEFAULT 0,
    reading_time INTEGER DEFAULT 0,
    scheduled_at TIMESTAMP,
    published_at TIMESTAMP,
    indexed_at TIMESTAMP,
    view_count BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_articles_type ON articles(type);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_video_id ON articles(video_id);
CREATE INDEX idx_articles_scheduled_at ON articles(scheduled_at);
CREATE INDEX idx_articles_indexing_status ON articles(indexing_status);
```

---

## API Endpoints (gofiber_subth)

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/articles/slug/:slug` | Get published article by slug |

### Worker Endpoints (Service Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/articles/ingest` | Create/Update article from worker |

### Admin Endpoints (JWT + Admin Role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/articles` | List articles (paginated, filterable) |
| GET | `/api/v1/articles/stats` | Get article statistics |
| GET | `/api/v1/articles/:id` | Get article detail |
| PATCH | `/api/v1/articles/:id/status` | Update article status |
| POST | `/api/v1/articles/bulk-schedule` | Bulk schedule articles |
| DELETE | `/api/v1/articles/:id` | Delete article |

---

## Article Types

```go
type ArticleType string

const (
    ArticleTypeSEO    ArticleType = "seo"    // Auto-generated from video SRT
    ArticleTypeNews   ArticleType = "news"   // Manual news articles
    ArticleTypeReview ArticleType = "review" // Video reviews
)
```

---

## Article Statuses

```go
type ArticleStatus string

const (
    ArticleStatusDraft     ArticleStatus = "draft"
    ArticleStatusScheduled ArticleStatus = "scheduled"
    ArticleStatusPublished ArticleStatus = "published"
    ArticleStatusArchived  ArticleStatus = "archived"
)
```

---

## Indexing Statuses

```go
type IndexingStatus string

const (
    IndexingStatusPending IndexingStatus = "pending"
    IndexingStatusIndexed IndexingStatus = "indexed"
    IndexingStatusFailed  IndexingStatus = "failed"
)
```

---

## Content JSON Structure (JSONB)

```json
{
  "videoID": "uuid",
  "title": "SEO-optimized title",
  "metaTitle": "Max 60 chars",
  "metaDescription": "Max 160 chars",
  "slug": "video-code",
  "thumbnailURL": "https://files.subth.com/...",
  "thumbnailAlt": "Descriptive alt text",
  "summary": "3-5 sentence summary",
  "highlights": ["highlight 1", "highlight 2"],
  "detailedReview": "Long-form review content",
  "castProfiles": [...],
  "makerInfo": {...},
  "tagDescriptions": [...],
  "keyMoments": [...],
  "faqItems": [...],
  "galleryImages": [...],
  "qualityScore": 85,
  "readingTime": 5,
  "createdAt": "2026-02-23T00:00:00Z",
  "updatedAt": "2026-02-23T00:00:00Z"
}
```

---

## SEO Worker Flow

```
1. Receive job from NATS queue
   ↓
2. Fetch SRT content from iDrive e2
   ↓
3. Fetch video metadata from api.subth.com
   ↓
4. Fetch gallery images from iDrive e2
   ↓
5. Select best images (ImageSelector - Python)
   ↓
6. Generate article content (Gemini AI)
   ↓
7. Copy images from e2 → r2 (ImageCopier)
   ↓
8. Publish article to api.subth.com
   ↓
9. Send completion notification
```

---

## Image Copying (e2 → r2)

### Source (iDrive e2 - suekk)
- Bucket: `suekk`
- Path: `{video_code}/gallery/safe/`
- URL: `https://f8n8.c18.e2-1.dev/suekk/...`

### Destination (Cloudflare R2 - subth)
- Bucket: `subth`
- Path: `articles/{video_code}/gallery/`
- URL: `https://files.subth.com/articles/...`

---

## Next Steps (Priority Order)

1. **Admin Frontend** (vite_subth) - 🔄 IN PROGRESS
   - Create article feature module
   - Article list with filters (status, type, indexing)
   - Article detail view with content preview
   - Manual publish/archive actions
   - Bulk schedule functionality

2. **Customer Frontend** (nextjs_subth)
   - Article page with SEO metadata
   - Structured data (JSON-LD)
   - Sitemap integration

3. **Google Indexing API**
   - Submit URL หลัง publish
   - Track indexing status

---

*Last updated: 2026-02-23*

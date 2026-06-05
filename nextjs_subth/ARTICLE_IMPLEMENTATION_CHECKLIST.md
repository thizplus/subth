# Article Implementation Checklist for nextjs_subth

> Implementation checklist สำหรับหน้า Public Article และ SEO features
> อ้างอิงจาก: `_seo_worker/FRONTEND_IMPLEMENTATION_PLAN.md` v2.3

---

## Overview

### Current State
- ✅ Member video page: `/member/videos/[id]` (มี video player)
- ❌ Public article page: ไม่มี (ต้องสร้างใหม่)
- ❌ Article feature module: ไม่มี
- ❌ Schema.org components: ไม่มี
- ❌ Auto-linking: ไม่มี

### Target Architecture
```
/articles/{slug}       → Public Article (SEO, Google Index)
/member/videos/{id}    → Member Video (Player, noindex)
```

### URL Strategy
- `/articles/` = บทความ SEO (อ่าน, ไม่มี player)
- `/member/videos/` = หน้าดูวิดีโอ (player, ต้อง login)

---

## Phase 1: Core Infrastructure

### 1.1 API Routes & Types
```
src/lib/constants/index.ts
```
- [ ] เพิ่ม `ARTICLES` routes
  ```typescript
  ARTICLES: {
    BY_SLUG: (slug: string) => `/api/v1/articles/slug/${slug}`,  // Public - NO AUTH
  },
  ```
  > **Note:** Gallery URLs อยู่ใน article content แล้ว (R2 public URLs) - ไม่ต้องมี API แยก

### 1.2 Article Feature Module
```
src/features/article/
├── components/
│   ├── index.ts                    # Barrel export
│   ├── thumbnail-with-cta.tsx      # Thumbnail + Play overlay → login
│   ├── key-moments-preview.tsx     # Progress bar with moments
│   ├── gallery-section.tsx         # Trust-Building Gallery
│   ├── expert-box.tsx              # Expert analysis box
│   ├── faq-accordion.tsx           # FAQ section
│   ├── quote-card.tsx              # Top quotes display
│   ├── technical-specs.tsx         # Video/Audio quality table
│   ├── cast-card.tsx               # Cast profile card
│   ├── maker-card.tsx              # Maker info card
│   └── related-articles.tsx        # Related articles grid
├── service.ts                      # API calls
├── types.ts                        # TypeScript interfaces
├── hooks.ts                        # Custom hooks (useKeyMomentClick)
└── index.ts                        # Barrel export
```

- [ ] สร้าง `types.ts`
  ```typescript
  interface Article {
    id: string
    videoId: string
    videoCode: string
    slug: string
    title: string
    metaTitle: string
    metaDescription: string
    content: ArticleContent
    status: 'draft' | 'scheduled' | 'published' | 'archived'
    publishedAt: string
    // ... from dto/article.go
  }

  interface ArticleContent {
    summary: string
    summaryShort: string
    detailedReview: string
    expertAnalysis: string
    dialogueAnalysis: string
    characterInsight: string
    keyMoments: KeyMoment[]
    topQuotes: TopQuote[]
    faqItems: FAQItem[]
    galleryImages: GalleryImage[]           // Public (super_safe)
    memberGalleryImages?: GalleryImage[]    // Member only (safe + nsfw)
    memberGalleryCount?: number             // Total member images count
    thumbnailUrl: string                    // Cover image
    castProfiles: CastProfile[]
    makerInfo: MakerInfo
    tagDescriptions: TagDescription[]
    // ... จาก SEO Worker output
  }
  ```

- [ ] สร้าง `service.ts`
  ```typescript
  export const articleService = {
    async getBySlug(slug: string, lang?: string): Promise<Article>
    async getGalleryUrls(code: string): Promise<GalleryUrls>
  }
  ```

- [ ] สร้าง `hooks.ts`
  ```typescript
  export function useKeyMomentClick(videoId: string, slug: string) {
    // Handle redirect to login with timestamp
  }
  ```

---

## Phase 2: Components

### 2.1 Public Page Components

#### ThumbnailWithCTA
```
src/features/article/components/thumbnail-with-cta.tsx
```
- [ ] Thumbnail ขนาดใหญ่ (aspect-video)
- [ ] Play button overlay
- [ ] Click → redirect to login with `?redirect=/member/video/{id}`
- [ ] Priority loading (above the fold)

#### KeyMomentsPreview
```
src/features/article/components/key-moments-preview.tsx
```
- [ ] Progress bar แสดง moment markers
- [ ] Tooltip แสดงชื่อ moment
- [ ] Click → redirect to login with `?t={timestamp}`
- [ ] Format timestamp (MM:SS)

#### GallerySection
```
src/features/article/components/gallery-section.tsx
```
- [ ] แสดง gallery images จาก article content (R2 URLs)
- [ ] Grid layout (3 columns)
- [ ] Lazy loading สำหรับรูปที่ 4+
- [ ] (Optional) CTA "ดูเพิ่มเติม" → redirect to member page

#### ExpertBox
```
src/features/article/components/expert-box.tsx
```
- [ ] Box styling พิเศษ (border, background)
- [ ] แสดง expertAnalysis
- [ ] แสดง dialogueAnalysis
- [ ] แสดง characterInsight

#### FAQAccordion
```
src/features/article/components/faq-accordion.tsx
```
- [ ] ใช้ shadcn/ui Accordion component
- [ ] แสดง faqItems
- [ ] แสดง technicalFaq (ถ้ามี)
- [ ] เปิด item แรกโดย default

#### QuoteCard
```
src/features/article/components/quote-card.tsx
```
- [ ] แสดง quote text
- [ ] Timestamp badge (click → login + seek)
- [ ] Emotion badge
- [ ] Context description

#### TechnicalSpecs
```
src/features/article/components/technical-specs.tsx
```
- [ ] แสดง videoQuality, audioQuality
- [ ] แสดง translationMethod, subtitleQuality
- [ ] แสดง readingTime

#### CastCard
```
src/features/article/components/cast-card.tsx
```
- [ ] รูปภาพ + ชื่อ
- [ ] Bio (สั้นๆ)
- [ ] Link → `/member/casts/{slug}` (ใช้ rel="nofollow" บน public)

#### RelatedArticles
```
src/features/article/components/related-articles.tsx
```
- [ ] Grid ของ article thumbnails
- [ ] ใช้ comparisonNote หรือ similar videos
- [ ] Link → `/articles/{slug}` (public article)

### 2.2 Schema Components
```
src/features/article/components/schema/
├── index.ts
├── video-object-schema.tsx
├── faq-page-schema.tsx
├── article-schema.tsx
└── breadcrumb-schema.tsx
```

#### VideoObjectSchema
- [ ] JSON-LD script tag
- [ ] `isAccessibleForFree: false`
- [ ] `requiresSubscription` object
- [ ] `hasPart` for key moments (Clip type)
- [ ] ไม่ใส่ contentUrl (member only)

#### FAQPageSchema
- [ ] JSON-LD script tag
- [ ] Map faqItems → Question/Answer

#### ArticleSchema
- [ ] JSON-LD script tag
- [ ] author, publisher, datePublished
- [ ] potentialAction: WatchAction

#### BreadcrumbSchema
- [ ] JSON-LD script tag
- [ ] Home → Category → Article

---

## Phase 3: Pages

### 3.1 Public Article Page
```
src/app/(public)/articles/[slug]/page.tsx
```
- [ ] Server Component (RSC)
- [ ] Fetch article by slug
- [ ] Generate metadata (title, description, OG)
- [ ] Layout structure:
  ```
  1. ThumbnailWithCTA + summaryShort (above fold)
  2. KeyMomentsPreview
  3. Title (H1)
  4. Cast/Maker/Tags cards
  5. Summary (full text)
  6. GallerySection (Trust-Building)
  7. Expert Analysis box
  8. Top Quotes
  9. Detailed Review
  10. FAQ Accordion
  11. Technical Specs
  12. Related Videos
  13. Schema JSON-LD
  ```

#### Metadata Generation
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const article = await articleService.getBySlug(params.slug)
  return {
    title: article.metaTitle,
    description: article.metaDescription,
    openGraph: {
      type: 'video.other',
      title: article.metaTitle,
      description: article.metaDescription,
      images: [article.content.thumbnailUrl],
    },
    twitter: {
      card: 'summary_large_image',
    },
  }
}
```

### 3.2 English Version
```
src/app/en/articles/[slug]/page.tsx
```
- [ ] Same structure, pass `lang="en"` to service
- [ ] Use English dictionary

### 3.3 Member Video Page Updates
```
src/app/member/videos/[id]/page.tsx
```
- [ ] Add auto-seek from URL param `?t={seconds}`
- [ ] Add KeyMomentsBar (functional - click to seek)
- [ ] Add `<meta name="robots" content="noindex, nofollow" />`

### 3.4 Internal Contextual Linking (SEO Boost)

> **เหตุผล:** ลิงก์ที่อยู่ในบริบทของประโยค (Contextual Link) มีพลัง SEO สูงกว่าลิงก์ในหน้า Related ทั่วไป

#### SEO Worker Output (ต้องเพิ่มใน content)
```typescript
interface ArticleContent {
  // ... existing fields
  contextualLinks?: ContextualLink[]  // AI-generated linking sentences
}

interface ContextualLink {
  text: string      // ประโยคเชื่อมโยง
  linkedSlug: string // Slug ของ article ที่ลิงก์ไป
  linkedTitle: string // Title สำหรับแสดง
}
```

#### Example Output
```json
{
  "contextualLinks": [
    {
      "text": "ถ้าคุณประทับใจการแสดงแนว Medical ของ Zemba Mami ในเรื่องนี้ คุณอาจจะสนใจ",
      "linkedSlug": "dldss-470-zemba-mami",
      "linkedTitle": "DLDSS-470 ที่เน้นการสำรวจอารมณ์ในอีกรูปแบบหนึ่ง"
    }
  ]
}
```

#### Frontend Component
```
src/features/article/components/contextual-links.tsx
```
- [ ] แสดง contextual links ในส่วน detailedReview หรือก่อน Related Videos
- [ ] ใช้ `<Link>` ปกติ (ไม่ใส่ nofollow - ต้องการ SEO juice)
- [ ] Styling ให้ดูเป็นธรรมชาติ ไม่โดดเกินไป

#### SEO Worker Update (ต้องแก้)
- [ ] เพิ่ม prompt ให้ AI สร้าง contextual links 2-3 ประโยค
- [ ] ใช้ข้อมูลจาก related videos / same cast / same maker
- [ ] ประโยคต้องเป็นธรรมชาติ ไม่เหมือนสแปม

---

## Phase 4: Auto-Linking

### 4.1 Auto-Link Utility
```
src/features/article/utils/auto-link.tsx
```
- [ ] Function to replace cast names → links
- [ ] Function to replace maker names → links
- [ ] Function to replace tag names → links
- [ ] Return React components (not strings)

```typescript
interface LinkTarget {
  name: string
  slug: string
  type: 'cast' | 'maker' | 'tag'
}

interface AutoLinkOptions {
  firstOccurrenceOnly?: boolean  // Default: true (กฎทอง!)
}

export function autoLinkContent(
  content: string,
  targets: LinkTarget[],
  options?: AutoLinkOptions
): React.ReactNode
```

### 4.2 Golden Rule: First Occurrence Only

> **กฎทอง:** ลิงก์เฉพาะ "คำแรก" ที่ปรากฏในบทความเท่านั้น
> เพื่อไม่ให้หน้าเว็บดูรกเหมือนสแปม และช่วยให้ Google มองว่ามันเป็นเนื้อหาธรรมชาติ

```typescript
// ❌ WRONG - ลิงก์ทุกคำ
"Zemba Mami แสดงได้ดีมาก โดยเฉพาะฉากที่ Zemba Mami ..."
//  ^^^^^^^^^^^                           ^^^^^^^^^^^
//  [LINK]                                 [LINK] ← สแปม!

// ✅ CORRECT - ลิงก์คำแรกเท่านั้น
"Zemba Mami แสดงได้ดีมาก โดยเฉพาะฉากที่ Zemba Mami ..."
//  ^^^^^^^^^^^                           ^^^^^^^^^^^
//  [LINK]                                 plain text
```

- [ ] Track linked names ในแต่ละ section
- [ ] Skip ถ้าชื่อนั้นถูกลิงก์แล้ว
- [ ] Reset tracking เมื่อเปลี่ยน section (summary → detailedReview)

### 4.3 Integration Points
- [ ] ใช้ใน summary section
- [ ] ใช้ใน detailedReview section
- [ ] ใช้ใน expertAnalysis section
- [ ] Link ไป `/casts/{slug}`, `/makers/{slug}`, `/tags/{slug}`

---

## Phase 5: Login Flow

### 5.1 Timestamp Memory
```
src/app/(public)/login/page.tsx
```
- [ ] รับ `?redirect=` และ `?t=` params
- [ ] หลัง login → redirect to `{redirect}?t={timestamp}`

### 5.2 Auth Hook Updates
```
src/features/auth/hooks.ts
```
- [ ] `useLoginRedirect()` hook
  - Parse redirect URL from searchParams
  - Parse timestamp from searchParams
  - Construct final redirect URL

### 5.3 Post-Login Transition (Reduce Bounce Rate)

> **เหตุผล:** ลด Bounce Rate ระหว่างรอวิดีโอโหลด
> ให้ user เห็น feedback ว่ากำลังไปยังหน้าที่เลือก

```
src/features/auth/components/login-success-transition.tsx
```
- [ ] Component แสดงหลัง login สำเร็จ (ก่อน redirect)
- [ ] แสดงข้อความ "ยินดีต้อนรับ! กำลังนำคุณไปยังฉากที่เลือก..."
- [ ] แสดง loading spinner หรือ progress bar
- [ ] แสดง thumbnail ของวิดีโอที่จะไป (ถ้ามี)
- [ ] Auto redirect หลัง 1-2 วินาที

```typescript
interface LoginSuccessProps {
  redirectUrl: string
  videoTitle?: string
  thumbnailUrl?: string
  timestamp?: number  // ถ้ามี จะแสดง "ฉาก XX:XX"
}

export function LoginSuccessTransition({
  redirectUrl,
  videoTitle,
  thumbnailUrl,
  timestamp
}: LoginSuccessProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(redirectUrl)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      {thumbnailUrl && <img src={thumbnailUrl} className="rounded-lg" />}
      <h2>ยินดีต้อนรับ!</h2>
      <p>กำลังนำคุณไปยัง{timestamp ? ` ฉาก ${formatTime(timestamp)}` : 'วิดีโอ'}...</p>
      <Spinner />
    </div>
  )
}
```

#### Implementation Options
- [ ] **Option A:** Inline ใน login page (simple)
- [ ] **Option B:** Separate route `/login/success` (cleaner URL)
- [ ] **Option C:** Modal overlay (no route change)

---

## Phase 6: API Backend (gofiber_subth)

### 6.1 Public Article API ✅ DONE
```
gofiber_subth/interfaces/api/handlers/article_handler.go
gofiber_subth/interfaces/api/routes/article_routes.go
```
- [x] `GET /api/v1/articles/slug/:slug` - ไม่ต้อง auth (มีอยู่แล้ว)
- [x] Return `PublicArticleResponse` with full content (for SEO)
- [x] เฉพาะ status = "published"
- [x] ไม่มี auth middleware

> **API Route อยู่ใน `article_routes.go` line 13:**
> ```go
> articles.Get("/slug/:slug", h.ArticleHandler.GetPublishedArticle)
> ```

### 6.2 Gallery Images ✅ DONE

> **SEO Worker แก้แล้ว** - Copy ภาพทั้ง 3 tier ไป R2:
> - `articles/{code}/gallery/public/` = super_safe (Google-safe)
> - `articles/{code}/gallery/member/` = safe + nsfw
> - `articles/{code}/gallery/cover.jpg` = Cover image

- [x] ตัดสินใจ: Copy ALL images to R2 ✅
- [x] SEO Worker copy ภาพทั้ง 3 tier ไป R2 แล้ว
- [ ] (Optional) เพิ่ม member gallery endpoint ถ้าต้องการแสดง member images

---

## Testing Checklist

### SEO Validation
- [ ] Google Rich Results Test - VideoObject schema
- [ ] Google Rich Results Test - FAQPage schema
- [ ] OG tags validation (Facebook debugger)
- [ ] Twitter Card validation
- [ ] Internal links ไม่ใช่ nofollow (ยกเว้น member pages)
- [ ] Contextual links มี anchor text ที่เกี่ยวข้อง
- [ ] Auto-links ไม่ over-optimized (first occurrence only)

### Core Web Vitals
- [ ] LCP < 2.5s (thumbnail priority loading)
- [ ] FID < 100ms
- [ ] CLS < 0.1 (image dimensions set)

### Functionality
- [ ] Key moment click → login → redirect with timestamp
- [ ] Quote click → login → redirect with timestamp
- [ ] Gallery "ดูเพิ่มเติม" → login → show all images
- [ ] Auto-seek works on member video page
- [ ] Contextual links ไปยัง related articles ถูกต้อง
- [ ] Auto-link ลิงก์เฉพาะคำแรกเท่านั้น (ไม่สแปม)
- [ ] Post-login transition แสดงก่อน redirect
- [ ] Transition แสดง timestamp ถ้ามี `?t=` param

---

## File Structure Summary

```
nextjs_subth/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   └── articles/
│   │   │       └── [slug]/
│   │   │           └── page.tsx        # Public Article Page
│   │   ├── en/
│   │   │   └── articles/
│   │   │       └── [slug]/
│   │   │           └── page.tsx        # English version
│   │   └── member/
│   │       └── videos/
│   │           └── [id]/
│   │               └── page.tsx        # Update: auto-seek + noindex
│   ├── features/
│   │   ├── article/                    # NEW FEATURE
│   │   │   ├── components/
│   │   │   │   ├── index.ts
│   │   │   │   ├── thumbnail-with-cta.tsx
│   │   │   │   ├── key-moments-preview.tsx
│   │   │   │   ├── gallery-section.tsx
│   │   │   │   ├── expert-box.tsx
│   │   │   │   ├── faq-accordion.tsx
│   │   │   │   ├── quote-card.tsx
│   │   │   │   ├── technical-specs.tsx
│   │   │   │   ├── cast-card.tsx
│   │   │   │   ├── maker-card.tsx
│   │   │   │   ├── related-articles.tsx
│   │   │   │   ├── contextual-links.tsx   # NEW: SEO contextual links
│   │   │   │   └── schema/
│   │   │   │       ├── index.ts
│   │   │   │       ├── video-object-schema.tsx
│   │   │   │       ├── faq-page-schema.tsx
│   │   │   │       ├── article-schema.tsx
│   │   │   │       └── breadcrumb-schema.tsx
│   │   │   ├── utils/
│   │   │   │   └── auto-link.tsx          # UPDATE: first-occurrence-only
│   │   │   ├── service.ts
│   │   │   ├── types.ts
│   │   │   ├── hooks.ts
│   │   │   └── index.ts
│   │   └── auth/
│   │       └── components/
│   │           └── login-success-transition.tsx  # NEW: reduce bounce rate
│   └── lib/
│       └── constants/
│           └── index.ts                # Update: add ARTICLES routes
```

---

## Dependencies

### shadcn/ui Components (ต้องติดตั้งเพิ่ม)
```bash
npx shadcn@latest add accordion
```
- [ ] `accordion` - สำหรับ FAQ section

### Existing Components (มีแล้ว)
- ✅ `dialog` - สำหรับ login modal
- ✅ `button`, `card`, `badge`
- ✅ `tooltip`, `skeleton`

---

## Priority Order

1. **Week 1**: Phase 1-2 (Infrastructure + Components)
2. **Week 2**: Phase 3 (Pages + Contextual Links)
3. **Week 3**: Phase 4-5 (Auto-linking + Login Flow)
4. **Week 4**: Testing + SEO Validation

---

## SEO Worker Updates Required

> ต้องแก้ไข `_seo_worker` เพิ่มเติมสำหรับ contextual links

### 1. Add Contextual Links Generation
```
_seo_worker/use_cases/seo_handler.go
```
- [ ] เพิ่ม `contextualLinks` field ใน `ArticleContent`
- [ ] เพิ่ม prompt ให้ AI สร้างประโยคเชื่อมโยง 2-3 ประโยค
- [ ] Query related articles จาก same cast / same maker / same tags
- [ ] ส่ง related articles data ให้ AI สร้างประโยค

### 2. Update ArticleContent Model
```
_seo_worker/domain/models/article.go
```
```go
type ContextualLink struct {
    Text        string `json:"text"`        // ประโยคเชื่อมโยง
    LinkedSlug  string `json:"linkedSlug"`  // Slug ของ article ที่ลิงก์ไป
    LinkedTitle string `json:"linkedTitle"` // Title สำหรับแสดง
}

// Add to ArticleContent
ContextualLinks []ContextualLink `json:"contextualLinks,omitempty"`
```

---

## Notes

### nofollow Strategy
- ปุ่ม "ดูวิดีโอตัวเต็ม" → `rel="nofollow"` (ไป member page)
- ลิงก์ไป public pages (cast, maker, tag) → ไม่ใส่ nofollow

### Image Safety
- Public page แสดง `galleryImages` (super_safe: NSFW < 0.15 + face)
- Member page แสดง `memberGalleryImages` (safe + nsfw)
- CTA "ดูเพิ่มอีก X ภาพ" → redirect to login → member page
- ภาพทั้งหมดอยู่ใน R2 (public URL แต่ member images แสดงเฉพาะหลัง login)

### Content Rules
- แสดง text content ทั้งหมด (ไม่ lock)
- Lock เฉพาะ: video player, full gallery, key moments functionality

---

## URL Architecture Summary

### Storage Location

| Storage | Domain | Access | Content |
|---------|--------|--------|---------|
| **R2 (Cloudflare)** | `files.subth.com` | Public | thumbnails, all article images |

> **SEO Worker copies all tiers to R2:**
> - `gallery/public/` = super_safe (Google-safe, show on public article)
> - `gallery/member/` = safe + nsfw (show on member page only)
> - `gallery/cover.jpg` = First super_safe image
>
> URLs เป็น public แต่ member images แสดงเฉพาะบนหน้าที่ต้อง login

### Image Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SEO Worker Process (CopyTieredGallery)                                      │
│                                                                             │
│  e2 (Private)                         R2 (Public)                          │
│  ┌──────────────────┐                ┌────────────────────────────┐        │
│  │ gallery/{code}/  │                │ articles/{code}/gallery/   │        │
│  │                  │                │                            │        │
│  │   super_safe/    │  ──copy──>     │   public/                  │        │
│  │     001.jpg      │                │     001.jpg ... (Google)   │        │
│  │                  │                │                            │        │
│  │   safe/          │  ──copy──>     │   member/                  │        │
│  │   nsfw/          │  ──copy──>     │     001.jpg ... (login)    │        │
│  │                  │                │                            │        │
│  └──────────────────┘                │   cover.jpg                │        │
│                                      └────────────────────────────┘        │
│                                              │                              │
│                                              ▼                              │
│                   https://files.subth.com/articles/{code}/gallery/...      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### URL Patterns

| Type | URL Pattern | Auth | Source |
|------|-------------|------|--------|
| **Thumbnail** | `files.subth.com/thumbnails/{code}.jpg` | ❌ No | R2 |
| **Article Cover** | `files.subth.com/articles/{code}/gallery/cover.jpg` | ❌ No | R2 |
| **Public Gallery** | `files.subth.com/articles/{code}/gallery/public/001.jpg` | ❌ No | R2 |
| **Member Gallery** | `files.subth.com/articles/{code}/gallery/member/001.jpg` | ❌ No* | R2 |
| **Reel Video** | `cdn.suekk.com/{code}/output.mp4` | ❌ No | CDN |

> *Member Gallery: URLs are public but only shown on member pages (login required to see the page)

### Page URLs

| Page | URL | Content | Index |
|------|-----|---------|-------|
| **Public Article** | `/articles/{slug}` | SEO content, gallery, FAQ | ✅ Yes |
| **Member Video** | `/member/videos/{id}` | Video player | ❌ noindex |
| **Login** | `/login?redirect=/articles/{slug}` | Login form | ❌ noindex |

### Article Content Structure (from SEO Worker)

```json
{
  "content": {
    "galleryImages": [
      {
        "url": "https://files.subth.com/articles/utywgage/gallery/public/001.jpg",
        "alt": "DLDSS-471 - Zemba Mami - ในห้องตรวจ"
      }
    ],
    "memberGalleryImages": [
      {
        "url": "https://files.subth.com/articles/utywgage/gallery/member/001.jpg"
      }
    ],
    "memberGalleryCount": 37,
    "thumbnailUrl": "https://files.subth.com/articles/utywgage/gallery/cover.jpg"
  }
}
```

> **สำคัญ:**
> - `galleryImages` = super_safe (public) - แสดงบน public article
> - `memberGalleryImages` = safe + nsfw (member only) - แสดงหลัง login
> - `memberGalleryCount` = จำนวนภาพสำหรับ member (แสดง CTA "ดูเพิ่มอีก X ภาพ")
>
> URLs เป็น R2 public อยู่แล้ว - ไม่ต้องทำ presigned URLs

### API Summary

| Endpoint | Auth | Response |
|----------|------|----------|
| `GET /api/v1/articles/slug/{slug}` | ❌ No | `PublicArticleResponse` with full content |

> **Article Content Fields:**
> - `galleryImages`: Public R2 URLs (super_safe)
> - `memberGalleryImages`: Member R2 URLs (safe + nsfw)
> - `thumbnailUrl`: Cover image URL
>
> Gallery URLs อยู่ใน article content แล้ว → ไม่ต้องมี API แยก

---

*Last Updated: 2026-02-24*
*URL Structure: `/articles/{slug}` (Option 2)*
*Reference: `_seo_worker/FRONTEND_IMPLEMENTATION_PLAN.md` v2.3*

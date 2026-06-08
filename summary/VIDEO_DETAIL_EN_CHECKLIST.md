# Video Detail Page - English i18n & SEO Checklist

> สถานะ: COMPLETED - อัปเดตวันที่ 2026-06-08
> ไฟล์หลัก: `nextjs_subth/src/app/en/(main)/videos/[id]/page.tsx`

---

## Phase 1: Critical Bugs - DONE

### 1.1 Video Data ยังดึงเป็นภาษาไทย
- [x] `videoService.getById(id, "th")` ใน component -> เปลี่ยนเป็น `"en"`
- [x] `videoService.getById(id, "th")` ใน `generateMetadata` -> เปลี่ยนเป็น `"en"`

### 1.2 Internal Links ไม่มี `/en` prefix
- [x] `/category/${cat.slug}` -> `/en/category/${cat.slug}`
- [x] `/makers/${maker.slug}` -> `/en/makers/${maker.slug}`
- [x] `/casts/${cast.slug}` -> `/en/casts/${cast.slug}`
- [x] `/tags/${tag.slug}` -> `/en/tags/${tag.slug}`

### 1.3 Hardcoded Thai Text
- [x] วันที่ใช้ `formatThaiDate()` -> เปลี่ยนเป็น `formatEnglishDate()` (en-US)
- [x] "กำลังประมวลผล..." -> ใช้ `dict.common.loading` ("Loading...")
- [x] SEO description "ดู JAV ซับไทย" -> "Watch JAV with Subtitles"

### 1.4 Canonical URL ผิด
- [x] EN page canonical -> `/en/videos/${id}`
- [x] OG URL -> `/en/videos/${id}`

---

## Phase 2: SEO Improvements - DONE

### 2.1 Hreflang Tags
- [x] เพิ่ม `alternates.languages` ทั้ง TH + EN pages

### 2.2 OG Locale
- [x] EN page `og:locale: "en_US"` + `alternateLocale: ["th_TH"]`
- [x] TH page `og:locale: "th_TH"` + `alternateLocale: ["en_US"]`

### 2.3 VideoObject Schema
- [x] เพิ่ม `embedUrl`
- [x] เพิ่ม `inLanguage`
- [x] เพิ่ม `duration` (ISO 8601 format, conditional)
- [x] เพิ่ม `interactionStatistic` (WatchAction + view count)
- [x] EN page description เป็นภาษาอังกฤษ

### 2.4 BreadcrumbList Schema + UI
- [x] เพิ่ม BreadcrumbList structured data (JSON-LD) ทั้งสองหน้า
- [x] เพิ่ม Breadcrumb UI component (shadcn/ui) ทั้งสองหน้า

### 2.5 SEO Keywords
- [x] EN page keywords เป็นภาษาอังกฤษ

---

## Phase 3: Nice to Have - DONE

### 3.1 HTML lang attribute
- [x] Middleware set `x-locale` header ตาม path
- [x] Root layout `<html lang={locale}>` dynamic

### 3.2 Video Sitemap
- [x] สร้าง `sitemap/videos.xml/route.ts`
- [x] Generate URL ทั้ง TH + EN
- [x] เพิ่มเข้า sitemap index
- [x] เพิ่ม `<xhtml:link rel="alternate" hreflang>` ใน sitemap entries

### 3.3 Related Videos Section
- [x] เพิ่ม "Related Videos" ใต้ player ทั้งสองหน้า (Semantic Search API)
- [x] Graceful fallback ถ้าไม่มี embedding

### 3.4 VideoObject Schema เพิ่มเติม
- [x] เพิ่ม `duration` field ใน Go model + DTO + mapper
- [x] เพิ่ม `views` field ใน VideoResponse DTO + mapper
- [x] Frontend types อัปเดตรองรับ `views` + `duration`

---

## สรุปไฟล์ทั้งหมดที่แก้ไข/สร้าง

### Frontend (nextjs_subth)
| ไฟล์ | Action |
|------|--------|
| `src/app/en/(main)/videos/[id]/page.tsx` | Rewrite: EN i18n, SEO, breadcrumb, related videos |
| `src/app/(main)/videos/[id]/page.tsx` | เพิ่ม hreflang, og:locale, breadcrumb, related, duration, views |
| `src/app/layout.tsx` | Dynamic `<html lang>` จาก middleware header |
| `src/middleware.ts` | เพิ่ม `x-locale` header + ขยาย matcher |
| `src/app/sitemap/videos.xml/route.ts` | **สร้างใหม่** - Video sitemap + hreflang |
| `src/app/sitemap.xml/route.ts` | เพิ่ม videos.xml เข้า index |
| `src/features/video/types.ts` | เพิ่ม `views` + `duration` fields |

### Backend (gofiber_subth)
| ไฟล์ | Action |
|------|--------|
| `domain/models/video.go` | เพิ่ม `Duration` field |
| `domain/dto/video.go` | เพิ่ม `Views` + `Duration` ใน VideoResponse |
| `application/serviceimpl/video_service_impl.go` | Map `Views` + `Duration` ใน toVideoResponse |

### Summary
| ไฟล์ | Action |
|------|--------|
| `summary/VIDEO_DETAIL_EN_CHECKLIST.md` | Checklist นี้ |

---

## หมายเหตุ

- Backend ต้อง run migration เพื่อเพิ่ม `duration` column (GORM AutoMigrate)
- `duration` ค่าเริ่มต้นเป็น 0 - ต้องมี worker/manual update ใส่ค่าจริง
- `views` มีอยู่แล้วใน DB - ตอนนี้ expose ผ่าน API แล้ว
- Related Videos ต้องมี CLIP embeddings ใน semantic service ถึงจะแสดง

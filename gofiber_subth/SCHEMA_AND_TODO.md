# SubTH Database Schema & TODO

## Overview

ระบบฐานข้อมูลสำหรับ SubTH Video Database รองรับ Multi-language (EN, TH, JA)

---

## Current Schema Status

### Tables Summary

| Table | Description | Multi-lang | Status |
|-------|-------------|------------|--------|
| `videos` | ข้อมูลวิดีโอหลัก | via `video_translations` | ✅ Ready |
| `video_translations` | ชื่อวิดีโอหลายภาษา | - | ✅ Ready |
| `categories` | หมวดหมู่วิดีโอ | via `category_translations` | ✅ Ready |
| `category_translations` | ชื่อหมวดหมู่หลายภาษา | - | ✅ Ready |
| `makers` | ค่ายผลิต | ไม่ต้องแปล (brand name) | ✅ Ready |
| `casts` | นักแสดง | via `cast_translations` | ✅ Ready |
| `cast_translations` | ชื่อนักแสดงหลายภาษา | - | ✅ Ready |
| `tags` | แท็ก | via `tag_translations` | ✅ Ready |
| `tag_translations` | ชื่อแท็กหลายภาษา | - | ✅ Ready |
| `auto_tag_labels` | AI auto-tag labels | Built-in (name_en, name_th, name_ja) | ✅ Ready |
| `video_casts` | Junction: Video ↔ Cast | - | ✅ Ready |
| `video_tags` | Junction: Video ↔ Tag | - | ✅ Ready |

---

## Entity Relationship Diagram

```
                                    ┌──────────────────────┐
                                    │  category_translations│
                                    │  - id                │
                                    │  - category_id (FK)  │
                                    │  - lang              │
                                    │  - name              │
                                    └──────────┬───────────┘
                                               │ N:1
┌──────────────────────┐           ┌───────────┴───────────┐
│  video_translations  │           │      categories       │
│  - id                │           │  - id                 │
│  - video_id (FK)     │           │  - name               │
│  - lang              │           │  - slug               │
│  - title             │           │  - video_count        │
└──────────┬───────────┘           └───────────┬───────────┘
           │ N:1                               │ 1:N
           │                                   │
           │              ┌────────────────────┴────────────────────┐
           │              │                 videos                  │
           └──────────────┤  - id                                   │
                          │  - code (unique)                        │
                          │  - thumbnail                            │
                          │  - category_id (FK) ───────────────────►│
                          │  - maker_id (FK) ──────────────────────►│
                          │  - release_date                         │
                          │  - views                                │
                          │  - auto_tags[]                          │
                          └───────┬─────────────┬───────────────────┘
                                  │             │
                    ┌─────────────┘             └─────────────┐
                    │ N:M                               N:M   │
                    ▼                                         ▼
        ┌───────────────────┐                     ┌───────────────────┐
        │    video_casts    │                     │    video_tags     │
        │  - video_id       │                     │  - video_id       │
        │  - cast_id        │                     │  - tag_id         │
        └─────────┬─────────┘                     └─────────┬─────────┘
                  │                                         │
                  ▼                                         ▼
        ┌───────────────────┐                     ┌───────────────────┐
        │      casts        │                     │       tags        │
        │  - id             │                     │  - id             │
        │  - name           │                     │  - name           │
        │  - slug           │                     │  - slug           │
        │  - video_count    │                     │  - video_count    │
        └─────────┬─────────┘                     └─────────┬─────────┘
                  │ 1:N                                     │ 1:N
                  ▼                                         ▼
        ┌───────────────────┐                     ┌───────────────────┐
        │ cast_translations │                     │ tag_translations  │
        │  - id             │                     │  - id             │
        │  - cast_id (FK)   │                     │  - tag_id (FK)    │
        │  - lang           │                     │  - lang           │
        │  - name           │                     │  - name           │
        └───────────────────┘                     └───────────────────┘


        ┌───────────────────┐                     ┌───────────────────┐
        │      makers       │                     │  auto_tag_labels  │
        │  - id             │                     │  - key (PK)       │
        │  - name           │◄── 1:N ── videos    │  - name_en        │
        │  - slug           │                     │  - name_th        │
        │  - video_count    │                     │  - name_ja        │
        └───────────────────┘                     │  - category       │
        (ไม่ต้องแปล - brand name)                 └───────────────────┘
```

---

## TODO List

### 1. Import Data (Priority: High)

```bash
# Full import (DB + R2 images)
cd gofiber_subth
go run cmd/import/main.go \
  -data="D:\Admin\Desktop\MY PROJECT\_suekk_bot\output" \
  -images="D:\Admin\Desktop\MY PROJECT\_suekk_bot\output\images" \
  -workers=20

# Import เฉพาะ DB (skip images)
go run cmd/import/main.go \
  -data="..." \
  -images="..." \
  -skip-images
```

### 2. เพิ่มคำแปลภาษาไทย (Priority: Low - ทำทีหลัง)

หลังจาก import ข้อมูล EN แล้ว ค่อยเพิ่มคำแปล TH:

**Option A: Manual SQL**
```sql
-- ตัวอย่าง: เพิ่มคำแปล Category
INSERT INTO category_translations (id, category_id, lang, name)
SELECT gen_random_uuid(), id, 'th', 'JAV เซ็นเซอร์'
FROM categories WHERE name = 'Censored JAV';

-- ตัวอย่าง: เพิ่มคำแปล Tag
INSERT INTO tag_translations (id, tag_id, lang, name)
SELECT gen_random_uuid(), id, 'th', 'ครีมพาย'
FROM tags WHERE name = 'Creampie';
```

**Option B: API Endpoint** (TODO: สร้าง endpoint สำหรับ admin)
```
POST /api/v1/admin/translations
{
  "entity": "tag",
  "entity_id": "uuid-here",
  "lang": "th",
  "name": "ครีมพาย"
}
```

**Option C: Import Script** (TODO: สร้าง script สำหรับ bulk import translations)

---

## Data Summary (from scrape)

| Entity | Count |
|--------|-------|
| Videos | 143,465 |
| Categories | 2 |
| Makers | 498 |
| Casts | 6,571 |
| Tags | 285 |
| Images | 142,426 |

---

## Language Support Matrix

| Entity | EN | TH | JA |
|--------|----|----|-----|
| Video Title | ✅ จาก scrape | ❌ TODO | ❌ TODO |
| Category Name | ✅ จาก scrape | ❌ TODO | ❌ TODO |
| Maker Name | ✅ จาก scrape | - (ไม่ต้องแปล) | - (ไม่ต้องแปล) |
| Cast Name | ✅ จาก scrape | ❌ TODO | ❌ TODO |
| Tag Name | ✅ จาก scrape | ❌ TODO | ❌ TODO |
| Auto-tag Label | ✅ Built-in | ❌ TODO | ❌ TODO |

---

## API Usage Examples

### List Videos with Language
```
GET /api/v1/videos?lang=en&page=1&limit=20
GET /api/v1/videos?lang=th&page=1&limit=20
```

### Filter by Category
```
GET /api/v1/videos?category=censored-jav
GET /api/v1/videos?category=Censored%20JAV
```

### Get Video Detail
```
GET /api/v1/videos/{id}?lang=th
```

Response จะแสดงชื่อตาม lang ที่ระบุ ถ้าไม่มี fallback เป็น EN

---

## File Structure

```
gofiber_subth/
├── domain/
│   ├── models/
│   │   ├── video.go              # ✅
│   │   ├── video_translation.go  # ✅
│   │   ├── category.go           # ✅
│   │   ├── category_translation.go # ✅
│   │   ├── maker.go              # ✅ (ไม่ต้องแปล - brand name)
│   │   ├── cast.go               # ✅
│   │   ├── cast_translation.go   # ✅
│   │   ├── tag.go                # ✅
│   │   ├── tag_translation.go    # ✅
│   │   └── auto_tag_label.go     # ✅ (built-in multi-lang)
│   ├── repositories/
│   │   └── category_repository.go # ✅
│   └── ...
├── infrastructure/
│   └── postgres/
│       ├── category_repository_impl.go # ✅
│       └── database.go           # ✅ (migration)
├── cmd/
│   └── import/
│       └── main.go               # ✅ Import tool
└── ...
```

---

## Next Steps (แนะนำลำดับการทำ)

1. **[Required]** Run import tool เพื่อ import ข้อมูล EN
2. **[Required]** Test API endpoints
3. **[Later]** เพิ่มคำแปลภาษาไทย (TH)

---

## Commands Quick Reference

```bash
# Build
go build ./...

# Run server
go run cmd/api/main.go

# Dry-run import
go run cmd/import/main.go -data="..." -images="..." -dry-run

# Full import
go run cmd/import/main.go -data="..." -images="..." -workers=20

# Test R2 upload
go run cmd/r2test/main.go <image_path>
```

---

*Last updated: 2026-01-22*

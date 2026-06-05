# API Contract - GoFiber Backend

> สรุป API endpoints และ response types จาก `gofiber_subth` backend
> อ้างอิงจาก: `domain/dto/`, `interfaces/api/handlers/`

## Base URL

```
API_URL = http://localhost:8080 (dev)
```

---

## Response Wrapper

### Single Object Response
```typescript
{
  success: boolean
  message: string
  data: T
  error?: string  // เมื่อ success = false
}
```

### Paginated Response
```typescript
{
  success: boolean
  message: string
  data: T[]
  meta: {
    total: number   // จำนวนทั้งหมด
    offset: number  // ตำแหน่งเริ่มต้น
    limit: number   // จำนวนต่อหน้า
  }
  error?: string
}
```

---

## Videos API

### Endpoints

| Method | Endpoint | Description | Response Type |
|--------|----------|-------------|---------------|
| GET | `/api/v1/videos` | รายการวิดีโอ (pagination) | `VideoListItem[]` |
| GET | `/api/v1/videos/:id` | รายละเอียดวิดีโอ | `Video` |
| GET | `/api/v1/videos/code/:code` | ค้นหาด้วย code (ABC-123) | `Video` |
| GET | `/api/v1/videos/random` | วิดีโอสุ่ม | `VideoListItem[]` |
| GET | `/api/v1/videos/search` | ค้นหาวิดีโอ | `VideoListItem[]` |
| GET | `/api/v1/videos/cast/:id` | วิดีโอตาม cast | `VideoListItem[]` |
| GET | `/api/v1/videos/tag/:id` | วิดีโอตาม tag | `VideoListItem[]` |
| GET | `/api/v1/videos/maker/:id` | วิดีโอตาม maker | `VideoListItem[]` |

### Query Parameters
- `lang` - ภาษา (`th`, `en`, `ja`) default: `en`
- `limit` - จำนวนต่อหน้า
- `offset` - ตำแหน่งเริ่มต้น

### Types

```typescript
// List response (VideoListItemResponse)
interface VideoListItem {
  id: string           // uuid
  code?: string | null
  title: string        // แปลตาม lang
  thumbnail?: string
  category?: string
  releaseDate?: string | null
  maker?: string       // ชื่อ maker เป็น string
}

// Detail response (VideoResponse)
interface Video {
  id: string
  code?: string | null
  title: string
  translations?: Record<string, string>  // { en, th, ja }
  thumbnail?: string
  category?: string
  releaseDate?: string | null
  maker?: Maker        // full object
  casts?: Cast[]
  tags?: Tag[]
  autoTags?: AutoTag[]
  createdAt: string
  updatedAt: string
}

interface AutoTag {
  key: string
  name: string
  category: string
}
```

---

## Casts API

### Endpoints

| Method | Endpoint | Description | Response Type |
|--------|----------|-------------|---------------|
| GET | `/api/v1/casts` | รายการนักแสดง | `Cast[]` |
| GET | `/api/v1/casts/:id` | รายละเอียด cast | `CastDetail` |
| GET | `/api/v1/casts/slug/:slug` | ค้นหาด้วย slug | `CastDetail` |
| GET | `/api/v1/casts/search` | ค้นหา cast | `Cast[]` |
| GET | `/api/v1/casts/top` | Top casts | `Cast[]` |

### Query Parameters
- `lang` - ภาษา (`th`, `en`, `ja`) default: `en`
- `limit` - จำนวนต่อหน้า
- `offset` - ตำแหน่งเริ่มต้น
- `q` - search query (สำหรับ /search)

### Types

```typescript
// List response (CastResponse)
interface Cast {
  id: string
  name: string         // แปลตาม lang
  slug: string
  videoCount: number
}

// Detail response (CastDetailResponse)
interface CastDetail extends Cast {
  translations?: Record<string, string>  // { en, th, ja }
  createdAt: string
}
```

---

## Tags API

### Endpoints

| Method | Endpoint | Description | Response Type |
|--------|----------|-------------|---------------|
| GET | `/api/v1/tags` | รายการ tags | `Tag[]` |
| GET | `/api/v1/tags/:id` | รายละเอียด tag | `TagDetail` |
| GET | `/api/v1/tags/slug/:slug` | ค้นหาด้วย slug | `TagDetail` |
| GET | `/api/v1/tags/search` | ค้นหา tag | `Tag[]` |
| GET | `/api/v1/tags/top` | Top tags | `Tag[]` |
| GET | `/api/v1/tags/auto` | Auto tags list | `AutoTagLabel[]` |

### Query Parameters
- `lang` - ภาษา (`th`, `en`, `ja`) default: `en`
- `limit` - จำนวนต่อหน้า
- `offset` - ตำแหน่งเริ่มต้น
- `q` - search query (สำหรับ /search)

### Types

```typescript
// List response (TagResponse)
interface Tag {
  id: string
  name: string         // แปลตาม lang
  slug: string
  videoCount: number
}

// Detail response (TagDetailResponse)
interface TagDetail extends Tag {
  translations?: Record<string, string>  // { en, th, ja }
  createdAt: string
}

// Auto tags (AutoTagLabelResponse)
interface AutoTagLabel {
  key: string
  name: string
  category: string
}
```

---

## Makers API

### Endpoints

| Method | Endpoint | Description | Response Type |
|--------|----------|-------------|---------------|
| GET | `/api/v1/makers` | รายการ makers | `Maker[]` |
| GET | `/api/v1/makers/:id` | รายละเอียด maker | `MakerDetail` |
| GET | `/api/v1/makers/slug/:slug` | ค้นหาด้วย slug | `MakerDetail` |
| GET | `/api/v1/makers/search` | ค้นหา maker | `Maker[]` |
| GET | `/api/v1/makers/top` | Top makers | `Maker[]` |

### Query Parameters
- `limit` - จำนวนต่อหน้า
- `offset` - ตำแหน่งเริ่มต้น
- `q` - search query (สำหรับ /search)
- ⚠️ **ไม่มี `lang`** - Makers ไม่แปลภาษา

### Types

```typescript
// List response (MakerResponse)
interface Maker {
  id: string
  name: string         // ไม่แปล - ชื่อ English เสมอ
  slug: string
  videoCount: number
}

// Detail response (MakerDetailResponse)
interface MakerDetail extends Maker {
  createdAt: string
}
```

---

## Stats API (ถ้ามี)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/stats` | Overview stats |
| GET | `/api/v1/stats/top-makers` | Top makers |
| GET | `/api/v1/stats/top-casts` | Top casts |
| GET | `/api/v1/stats/top-tags` | Top tags |

---

## Semantic Search API (Python CLIP Service)

> ⚠️ อยู่ที่ `python_clip` ไม่ใช่ gofiber

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/search/text?q=...` | Text → CLIP → Similar videos |
| POST | `/api/v1/search/image` | Image → CLIP → Similar videos |
| GET | `/api/v1/search/similar/:id` | Find similar by embedding |

---

## Notes

1. **Pagination**: Backend ใช้ `offset` ไม่ใช่ `page`
   - คำนวณ: `offset = (page - 1) * limit`

2. **Language**:
   - Videos, Casts, Tags รองรับ `?lang=th|en|ja`
   - Makers ไม่รองรับ - ชื่อ English เสมอ

3. **Video List vs Detail**:
   - List: `maker` เป็น `string` (ชื่อ)
   - Detail: `maker` เป็น `object` (full data)

# SEO Article Structure - E-E-A-T Framework (Complete)

## Overview
โครงสร้างบทความสำหรับ Video Content ที่ออกแบบตาม **E-E-A-T** (Experience, Expertise, Authoritativeness, Trustworthiness) เพื่อให้เหนือกว่าเว็บคู่แข่ง

---

## E-E-A-T Breakdown

| Component | ความหมาย | วิธีสร้าง |
|-----------|----------|----------|
| **E**xperience | ประสบการณ์จริง | Timeline Highlights, Scene Analysis, Gallery |
| **E**xpertise | ความเชี่ยวชาญ | Dialogue Analysis, Character Insight, **Comparative Analysis** |
| **A**uthoritativeness | ความน่าเชื่อถือ | Full Story Summary, Plot Analysis, **Thematic Keywords** |
| **T**rustworthiness | ความไว้วางใจ | Translation Method, Quality Guarantee, **Technical FAQ** |

---

## 🎧 Text-to-Speech Feature (ElevenLabs)

### เหตุผลที่ควรมี
- **Accessibility**: คนไม่ต้องอ่าน กดฟังได้เลย
- **Dwell Time**: อยู่หน้าเว็บนานขึ้น = SEO ดีขึ้น
- **Unique Feature**: เว็บคู่แข่งไม่มี
- **Mobile Friendly**: ฟังระหว่างทำอย่างอื่นได้

### Implementation
```typescript
interface AudioArticle {
  // Audio Version
  audioUrl?: string           // URL ไฟล์เสียง (S3/CDN)
  audioDuration?: number      // ความยาว (วินาที)
  audioGeneratedAt?: Date     // วันที่สร้าง

  // TTS Settings
  ttsVoiceId?: string         // ElevenLabs Voice ID
  ttsStatus?: 'pending' | 'generating' | 'ready' | 'failed'
}
```

### Audio Content Strategy
```
┌─────────────────────────────────────────────┐
│  🎧 ฟังบทความนี้                            │
│  ┌─────────────────────────────────────┐    │
│  │ ▶  00:00 ━━━━━━━━━━━━━━━━━ 05:30   │    │
│  └─────────────────────────────────────┘    │
│  เสียงพากย์โดย: AI Voice (Premium)          │
└─────────────────────────────────────────────┘
```

### Content to Convert (Cost Optimization)
> 💡 **Pro-Tip**: ElevenLabs คิดค่าใช้จ่ายตามจำนวนตัวอักษร ไม่ต้องแปลงทั้งบทความ!

**แนะนำให้แปลงเฉพาะ (ประมาณ 1-2 นาที):**
1. **summaryShort** - สรุปสั้น 2-3 บรรทัด
2. **highlights** - ไฮไลท์ฉากสำคัญ (เฉพาะ title + description)
3. **recommendation** - เหมาะสำหรับใคร

**ไม่ต้องแปลง:**
- Full Summary (300-500 คำ) - ยาวเกินไป
- Top Quotes - มีภาษาญี่ปุ่นปน
- Technical Details - ไม่จำเป็นต้องฟัง

---

## 📋 Complete Article Schema

### 1. Basic Info (Required)
```typescript
interface ArticleBasicInfo {
  id: string
  slug: string              // url-friendly-slug
  videoId: string           // เชื่อมกับ Video
  status: 'draft' | 'published' | 'archived'

  // SEO Meta
  title: string             // H1: รีวิว [รหัส]: [นักแสดง] กับบทบาท...
  metaTitle: string         // Title Tag: [รหัส] ซับไทย - รีวิว | [ค่าย]
  metaDescription: string   // 150-160 chars

  // Thumbnail
  thumbnail: string
  thumbnailAlt: string      // Auto-generate (ดู Alt Text Pattern ด้านล่าง)
}
```

#### 🖼️ Alt Text Auto-Generate Pattern (Pro-Tip)
```
Format: รีวิว [รหัส] ฉาก[sceneLocation] ที่ [นักแสดง] แสดงอารมณ์[moodTone] ในซับไทยพรีเมียม

ตัวอย่าง: "รีวิว XXX-000 ฉากออฟฟิศ ที่ ยูอิ แสดงอารมณ์อ้อน ในซับไทยพรีเมียม"
```
**Benefit**: Google ชอบ Alt Text ที่มี Context ครบถ้วน (สถานที่ + อารมณ์ + คุณภาพ)
```

### 2. Video Metadata (Quick Facts)
```typescript
interface VideoMetadata {
  videoCode: string         // รหัสเรื่อง
  videoDuration: number     // ความยาว (นาที)
  videoReleaseDate?: string // วันที่ออก

  // Relations
  castIds: string[]         // นักแสดง (many-to-many)
  makerId?: string          // ค่าย
  genreIds: string[]        // แนว/หมวดหมู่
  tagIds: string[]          // Tags
}
```

### 3. Experience Section (E) - ประสบการณ์
```typescript
interface ExperienceSection {
  // Timeline Highlights - จุดเด่นตาม Timestamp
  highlights: {
    timestamp: string       // "15:30"
    title: string           // ชื่อฉาก
    description: string     // รายละเอียดสั้น
    screenshot?: string     // รูป Screenshot
    screenshotAlt?: string  // Alt text
  }[]

  // Scene Gallery
  gallery: {
    url: string
    alt: string             // Auto-generate: ฉาก [description] ใน [รหัส]
    caption: string
    timestamp?: string
  }[]

  // Scene Categories (สถานที่/บริบท)
  sceneLocations?: string[] // ["ออฟฟิศ", "ห้องนอน", "ออนเซ็น"]
}
```

### 4. Expertise Section (E) - ความเชี่ยวชาญ
```typescript
interface ExpertiseSection {
  // Dialogue Analysis - วิเคราะห์บทสนทนา
  dialogueAnalysis: string  // "นักแสดงใช้สรรพนาม あたし ซึ่งสื่อถึง..."

  // Character Insight
  characterInsight: string  // วิเคราะห์บุคลิกตัวละครผ่านคำพูด

  // Top Quotes - ประโยคเด็ดจากซับ
  topQuotes: {
    text: string            // ประโยคไทย
    textOriginal?: string   // ประโยคญี่ปุ่น (optional)
    timestamp?: string      // เวลา
    context?: string        // บริบท
    emotion?: string        // อารมณ์ (อ้อน, โกรธ, เศร้า)
  }[]

  // Language Notes
  languageNotes?: string    // "หางเสียง คะ/ครับ ตรงตามเพศตัวละคร"

  // ⭐ NEW: Comparative Expertise (เปรียบเทียบข้ามเรื่อง)
  actorPerformanceTrend?: string  // "พลิกบทบาทจากแนวอ้อนในเรื่อง [รหัส] มาเป็นสาวมั่น"
  comparisonNote?: string         // "บทพูดเผ็ดร้อนกว่าผลงานก่อนหน้า"
  previousWorks?: {               // ผลงานก่อนหน้าของนักแสดงคนเดียวกัน
    videoId: string
    videoCode: string
    comparisonPoint: string       // จุดเปรียบเทียบ
  }[]
}
```

### 5. Authoritativeness Section (A) - ความน่าเชื่อถือ
```typescript
interface AuthoritativenessSection {
  // Full Story Summary
  summary: string           // เนื้อเรื่องละเอียด 300-500 คำ
  summaryShort: string      // สรุปสั้น 2-3 บรรทัด

  // Character Dynamic
  characterDynamic: string  // ความสัมพันธ์ตัวละคร (เช่น อาจารย์กับลูกศิษย์)

  // Plot Analysis
  plotAnalysis?: string     // วิเคราะห์โครงเรื่อง

  // Recommendation
  recommendation?: string   // "เหมาะสำหรับคนที่ชอบแนว..."
  recommendedFor?: string[] // ["คนชอบแนว Drama", "แฟน [นักแสดง]"]

  // ⭐ NEW: Thematic Keywords (Semantic Search Signals)
  thematicKeywords: string[]      // ["ออนเซ็น", "นวด", "ห้องครัว", "ออฟฟิศ"]
  settingDescription?: string     // "เรื่องราวในรีสอร์ทริมทะเล"
  moodTone?: string[]             // ["โรแมนติก", "ตลก", "ดราม่า"]
}
```

### 6. Trustworthiness Section (T) - ความไว้วางใจ
```typescript
interface TrustworthinessSection {
  // Translation Quality
  translationMethod: string     // "แปลจากเสียงญี่ปุ่นโดยตรง (Direct Translation)"
  translationNote?: string      // หมายเหตุเพิ่มเติม
  translationAccuracy?: string  // "ความแม่นยำ 98%"

  // Technical Specs
  subtitleQuality: string       // "หางเสียงถูกต้องตามเพศตัวละคร"
  audioQuality?: string         // "ปรับจูนเสียงให้คมชัด"
  videoQuality?: string         // "1080p Full HD"

  // Author Info
  authorId: string
  authorName?: string
  authorAvatar?: string

  // Timestamps
  publishedAt?: Date
  updatedAt: Date

  // ⭐ NEW: Technical FAQ (ตอบคำถามจริงของผู้ใช้)
  technicalFaq: {
    question: string
    answer: string
    category?: 'translation' | 'quality' | 'content' | 'general'
  }[]
  // ตัวอย่าง:
  // Q: "ซับไทยเรื่องนี้แปลจาก AI หรือคน?"
  // A: "ใช้ระบบ Hybrid AI ที่จูนมาเพื่อภาษาหนังค่าย [ค่าย] โดยเฉพาะ"
}
```

### 7. SEO Enhancements
```typescript
interface SEOEnhancements {
  // Internal Links (Vector Similarity Recommended)
  relatedVideoIds: string[]     // วิดีโอที่เกี่ยวข้อง
  relatedBySameCast: string[]   // นักแสดงคนเดียวกัน
  relatedBySameMaker: string[]  // ค่ายเดียวกัน
  relatedBySameGenre: string[]  // แนวเดียวกัน
  relatedByTheme: string[]      // ธีมคล้ายกัน (จาก Vector Similarity)

  // FAQ Schema (สำหรับ Google Rich Snippets)
  faq: {
    question: string
    answer: string
  }[]

  // Keywords
  keywords: string[]            // SEO Keywords
  longTailKeywords?: string[]   // Long-tail Keywords

  // Breadcrumbs
  breadcrumbs: {
    name: string
    url: string
  }[]

  // Schema Markup Types
  schemaTypes: ('Article' | 'Review' | 'FAQPage' | 'VideoObject')[]
}
```

### 8. Rating & Engagement
```typescript
interface RatingSection {
  // Editorial Rating (ทีมงานให้คะแนน)
  ratingOverall?: number        // 1-10
  ratingStory?: number          // เนื้อเรื่อง
  ratingDialogue?: number       // บทพูด
  ratingPerformance?: number    // การแสดง
  ratingProduction?: number     // การผลิต

  // User Interaction
  viewCount: number
  likeCount?: number
  commentCount?: number
  shareCount?: number

  // Reading/Listening
  readingTime?: number          // นาทีในการอ่าน (คำนวณจากจำนวนคำ)
  listeningTime?: number        // นาทีในการฟัง (จาก TTS)
}
```

### 9. Audio Article (Text-to-Speech)
```typescript
interface AudioArticle {
  // TTS Settings
  ttsEnabled: boolean           // เปิดใช้งาน TTS หรือไม่
  ttsVoiceId?: string           // ElevenLabs Voice ID
  ttsModel?: string             // "eleven_v3"
  ttsSpeed?: number             // 1.0 = ปกติ

  // Generated Audio
  audioUrl?: string             // URL ไฟล์เสียง (S3/CDN)
  audioDuration?: number        // ความยาว (วินาที)
  audioFileSize?: number        // ขนาดไฟล์ (bytes)
  audioGeneratedAt?: Date       // วันที่สร้าง
  ttsStatus?: 'pending' | 'generating' | 'ready' | 'failed'
  ttsError?: string             // Error message ถ้า failed

  // Content to Convert (Cost-Optimized)
  audioContent?: string         // เนื้อหาที่จะแปลงเป็นเสียง
  // แนะนำ: summaryShort + highlights.title/description + recommendation เท่านั้น (1-2 นาที)
}
```

---

## 🎯 Complete Database Schema

```typescript
interface SEOArticle {
  // === Identity ===
  id: string
  slug: string
  videoId: string
  status: 'draft' | 'published' | 'archived'

  // === SEO Meta ===
  title: string
  metaTitle: string
  metaDescription: string

  // === Thumbnail ===
  thumbnail: string
  thumbnailAlt: string

  // === Video Info ===
  videoCode: string
  videoDuration: number
  videoReleaseDate?: string

  // === Relations ===
  castIds: string[]
  makerId?: string
  genreIds: string[]
  tagIds: string[]

  // === [E] Experience ===
  highlights: JSON              // Timeline highlights
  gallery: JSON                 // Screenshots
  sceneLocations: string[]      // สถานที่ในเรื่อง

  // === [E] Expertise ===
  dialogueAnalysis: string
  characterInsight: string
  topQuotes: JSON
  languageNotes?: string
  actorPerformanceTrend?: string    // ⭐ Comparative
  comparisonNote?: string           // ⭐ Comparative
  previousWorks: JSON               // ⭐ Comparative

  // === [A] Authoritativeness ===
  summary: string
  summaryShort: string
  characterDynamic: string
  plotAnalysis?: string
  recommendation?: string
  recommendedFor: string[]
  thematicKeywords: string[]        // ⭐ Semantic
  settingDescription?: string       // ⭐ Semantic
  moodTone: string[]                // ⭐ Semantic

  // === [T] Trustworthiness ===
  translationMethod: string
  translationNote?: string
  subtitleQuality: string
  technicalFaq: JSON                // ⭐ Technical FAQ

  // === SEO ===
  faq: JSON
  keywords: string[]
  longTailKeywords: string[]
  relatedVideoIds: string[]
  relatedBySameCast: string[]
  relatedBySameMaker: string[]
  relatedByTheme: string[]

  // === Rating ===
  ratingOverall?: number
  ratingStory?: number
  ratingDialogue?: number
  ratingPerformance?: number
  readingTime?: number

  // === Audio (TTS) ===
  ttsEnabled: boolean
  ttsVoiceId?: string
  audioUrl?: string
  audioDuration?: number
  ttsStatus?: string
  audioContent?: string

  // === Engagement ===
  viewCount: number
  likeCount?: number

  // === Vector Similarity (pgvector) ===
  embedding?: vector(1536)      // OpenAI text-embedding-3-small

  // === Timestamps ===
  authorId: string
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

---

## 📊 E-E-A-T Checklist (Updated)

### Experience (ประสบการณ์)
- [ ] Timeline Highlights (5+ จุดสำคัญ)
- [ ] Screenshots พร้อม Caption
- [ ] Timestamp ที่แม่นยำ
- [ ] Scene Description
- [ ] Scene Locations (สถานที่)

### Expertise (ความเชี่ยวชาญ)
- [ ] Dialogue Analysis
- [ ] Character Insight
- [ ] Top 3-5 Quotes จากซับ
- [ ] Language Notes (สรรพนาม, หางเสียง)
- [ ] ⭐ **Comparative Analysis** (เปรียบเทียบกับเรื่องอื่น)
- [ ] ⭐ **Actor Performance Trend** (พัฒนาการนักแสดง)

### Authoritativeness (ความน่าเชื่อถือ)
- [ ] Full Story Summary (300-500 คำ)
- [ ] Character Dynamic
- [ ] Plot Analysis
- [ ] Recommendation
- [ ] ⭐ **Thematic Keywords** (Semantic Search)
- [ ] ⭐ **Setting Description**
- [ ] ⭐ **Mood/Tone**

### Trustworthiness (ความไว้วางใจ)
- [ ] Translation Method ระบุชัดเจน
- [ ] Quality Guarantee
- [ ] Author Information
- [ ] Last Updated Date
- [ ] ⭐ **Technical FAQ** (ตอบคำถามจริงของผู้ใช้)

### Audio Feature (TTS)
- [ ] Enable/Disable TTS
- [ ] Voice Selection
- [ ] Auto-generate Audio
- [ ] Audio Player UI

### SEO Technical
- [ ] Schema Markup (Article, Review, FAQ, VideoObject)
- [ ] Internal Links (Vector Similarity)
- [ ] Breadcrumbs
- [ ] Meta Title/Description
- [ ] Alt Text ทุกรูป (Auto-generate)

---

## 🏗️ Page Layout Structure (Updated)

```
┌─────────────────────────────────────────────┐
│ Breadcrumbs                                 │
│ Home > ค่าย > นักแสดง > รหัส                 │
├─────────────────────────────────────────────┤
│ H1: รีวิว [รหัส]: [นักแสดง] กับบทบาท...      │
├─────────────────────────────────────────────┤
│ 🎧 ฟังบทความนี้                             │
│ ▶  00:00 ━━━━━━━━━━━━━━━━━ 05:30           │
├─────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────────────────┐ │
│ │  Thumbnail  │ │ Quick Facts             │ │
│ │   (Cover)   │ │ • รหัส: XXX-000         │ │
│ │             │ │ • นักแสดง: ชื่อ          │ │
│ │             │ │ • ค่าย: ชื่อค่าย         │ │
│ │             │ │ • ความยาว: 120 นาที     │ │
│ │             │ │ • แนว: Drama, Romance   │ │
│ │             │ │ • สถานที่: ออฟฟิศ       │ │
│ └─────────────┘ └─────────────────────────┘ │
├─────────────────────────────────────────────┤
│ Summary (เรื่องย่อ)                          │
│ บทความ 300-500 คำ...                        │
├─────────────────────────────────────────────┤
│ Timeline Highlights                         │
│ ├─ 05:10 - ฉากเปิดเรื่อง... [📷]            │
│ ├─ 18:45 - จุดเปลี่ยนสำคัญ... [📷]          │
│ └─ 45:20 - ไคลแมกซ์... [📷]                 │
├─────────────────────────────────────────────┤
│ Top Quotes (ประโยคเด็ด)                      │
│ 💬 "ประโยคจากซับไทย..." (15:30)             │
│ 💬 "ประโยคที่สอง..." (28:45)                │
├─────────────────────────────────────────────┤
│ Character Analysis                          │
│ วิเคราะห์ตัวละครและบทสนทนา...                │
│                                             │
│ ⭐ เปรียบเทียบกับผลงานก่อนหน้า:              │
│ "พลิกบทบาทจากแนวอ้อนในเรื่อง [รหัส]..."     │
├─────────────────────────────────────────────┤
│ Translation Quality                         │
│ • แปลจากเสียงญี่ปุ่นโดยตรง                   │
│ • ระบบ Hybrid AI จูนสำหรับค่าย [ค่าย]       │
│ • หางเสียงถูกต้องตามเพศตัวละคร               │
├─────────────────────────────────────────────┤
│ Rating                                      │
│ ⭐ Overall: 8.5/10                          │
│ 📖 Story: 8/10 | 💬 Dialogue: 9/10          │
│ ⏱️ อ่าน ~5 นาที | 🎧 ฟัง ~5:30 นาที         │
├─────────────────────────────────────────────┤
│ Related Videos (Vector Similarity)          │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐            │
│ │Same │ │Same │ │Same │ │Same │            │
│ │Cast │ │Maker│ │Genre│ │Theme│            │
│ └─────┘ └─────┘ └─────┘ └─────┘            │
├─────────────────────────────────────────────┤
│ FAQ                                         │
│ Q: ซับไทยเรื่องนี้แปลจาก AI หรือคน?         │
│ A: ใช้ระบบ Hybrid AI ที่จูนมาเพื่อค่าย...   │
│                                             │
│ Q: มีการเซนเซอร์คำหยาบในซับหรือไม่?          │
│ A: ไม่มีการเซนเซอร์ แปลตามต้นฉบับ 100%      │
├─────────────────────────────────────────────┤
│ CTA: สมัครสมาชิกเพื่อรับชมฉบับเต็ม           │
└─────────────────────────────────────────────┘
```

---

## 🔗 Internal Linking Strategy (Vector Similarity)

```
                    ┌─────────────┐
                    │   Article   │
                    │  (รหัส XXX) │
                    └──────┬──────┘
                           │
    ┌──────────────────────┼──────────────────────┐
    │                      │                      │
    ▼                      ▼                      ▼
┌─────────┐          ┌─────────┐          ┌─────────┐
│  Same   │          │  Same   │          │  Same   │
│  Cast   │          │  Maker  │          │  Theme  │
│ (นักแสดง)│          │  (ค่าย) │          │ (Vector)│
└────┬────┘          └────┬────┘          └────┬────┘
     │                    │                    │
     ▼                    ▼                    ▼
┌─────────────────────────────────────────────────┐
│           Topic Clusters (Google loves this)    │
└─────────────────────────────────────────────────┘
```

### Vector Similarity Logic

#### 🗄️ Database: pgvector (PostgreSQL Extension)
> 💡 **แนะนำ**: ใช้ `pgvector` เพราะรวมเข้ากับ Article Model เดิมได้ง่ายที่สุด ไม่ต้องใช้ Database แยก (เช่น Pinecone)

**Installation:**
```sql
CREATE EXTENSION IF NOT EXISTS vector;

-- เพิ่ม column embedding ใน articles table
ALTER TABLE articles ADD COLUMN embedding vector(1536);

-- สร้าง index สำหรับ cosine similarity
CREATE INDEX ON articles USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

**Query Logic:**
```typescript
// ใช้ Embedding จาก Summary เพื่อหาเรื่องที่คล้ายกัน
async function findRelatedByTheme(articleId: string, limit: number = 5) {
  const article = await getArticle(articleId)
  const embedding = await getEmbedding(article.summary) // OpenAI/Gemini Embedding

  return await db.query(`
    SELECT id, video_code, title,
           1 - (embedding <=> $1) as similarity
    FROM articles
    WHERE id != $2 AND status = 'published'
    ORDER BY embedding <=> $1
    LIMIT $3
  `, [embedding, articleId, limit])
}
```

**Embedding Options:**
| Provider | Model | Dimensions | Cost |
|----------|-------|------------|------|
| OpenAI | text-embedding-3-small | 1536 | $0.02/1M tokens |
| OpenAI | text-embedding-3-large | 3072 | $0.13/1M tokens |
| Google | text-embedding-004 | 768 | Free (limited) |

---

## 🛠️ JSON-LD Schema Markup

### Article + Review + FAQ + VideoObject with Key Moments
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": "[title]",
      "description": "[metaDescription]",
      "image": "[thumbnail]",
      "author": {
        "@type": "Person",
        "name": "[authorName]"
      },
      "datePublished": "[publishedAt]",
      "dateModified": "[updatedAt]"
    },
    {
      "@type": "Review",
      "itemReviewed": {
        "@type": "Movie",
        "name": "[videoCode]"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "[ratingOverall]",
        "bestRating": "10"
      },
      "author": {
        "@type": "Person",
        "name": "[authorName]"
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "[question]",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "[answer]"
          }
        }
      ]
    },
    {
      "@type": "VideoObject",
      "name": "[videoCode] - [title]",
      "description": "[summaryShort]",
      "thumbnailUrl": "[thumbnail]",
      "duration": "PT[videoDuration]M",
      "hasPart": [
        {
          "@type": "Clip",
          "name": "[highlight.title]",
          "startOffset": "[highlight.timestamp in seconds]",
          "description": "[highlight.description]"
        }
      ]
    }
  ]
}
```

> 💡 **Pro-Tip**: `hasPart` กับ `Clip` จะทำให้ Google แสดง **"Key Moments"** (แถบเวลา) ในหน้าค้นหา ทำให้เว็บโดดเด่นกว่าคู่แข่ง 10 เท่า!

---

## 📝 Implementation Priority

### Phase 1: Backend (Article Model Update)
1. [ ] เพิ่ม E-E-A-T fields ใน Article Model
2. [ ] เพิ่ม TTS fields (audioUrl, ttsStatus, etc.)
3. [ ] สร้าง Cast/Maker relations
4. [ ] Migration

### Phase 2: TTS Integration
1. [ ] สร้าง TTS Worker (ElevenLabs API)
2. [ ] Generate audio content (Summary + Highlights)
3. [ ] Upload to S3/CDN
4. [ ] Update article with audioUrl

### Phase 3: Frontend (Admin)
1. [ ] Article Editor Form (ทุก E-E-A-T fields)
2. [ ] Timeline Highlights Editor
3. [ ] Quote Picker (จาก Subtitle)
4. [ ] Gallery Manager
5. [ ] TTS Preview/Generate

### Phase 4: Frontend (Public)
1. [ ] Article Page Layout (ตาม Structure)
2. [ ] Audio Player Component
3. [ ] Related Articles (Internal Links)
4. [ ] JSON-LD Schema Output

### Phase 5: AI Integration
1. [ ] Gemini Prompt สำหรับสกัด E-E-A-T content
2. [ ] Auto-generate Summary/Analysis
3. [ ] Vector Similarity สำหรับ Related Articles

---

## 🚀 Competitive Advantages

| Feature | เว็บคู่แข่ง | เว็บเรา |
|---------|------------|--------|
| เรื่องย่อ | 2-3 บรรทัด | 300-500 คำ + Analysis |
| Timeline | ❌ ไม่มี | ✅ มีพร้อม Timestamp |
| Quotes | ❌ ไม่มี | ✅ ประโยคเด็ดจากซับ |
| Comparative | ❌ ไม่มี | ✅ เปรียบเทียบข้ามเรื่อง |
| Audio | ❌ ไม่มี | ✅ ฟังบทความได้ (TTS) |
| Semantic | ❌ ไม่มี | ✅ Thematic Keywords |
| Internal Links | สุ่ม | Vector Similarity |
| FAQ | ❌ ไม่มี | ✅ Technical FAQ |

---

---

## 💰 Implementation Difficulty & ROI

| ส่วนประกอบ | ความยาก | ผลลัพธ์ที่ได้ |
|-----------|---------|--------------|
| E-E-A-T Schema | ปานกลาง | ความน่าเชื่อถือสูงสุด |
| TTS Integration | ปานกลาง | เพิ่ม Dwell Time + ความแปลกใหม่ |
| Vector Related (pgvector) | ยากที่สุด | การรักษา User ในเว็บ (Retention) |
| Technical FAQ | ง่าย | ชนะ Trustworthiness (T) |
| Alt Text Automation | ง่าย | SEO Image Search |
| JSON-LD Key Moments | ง่าย | โดดเด่นใน Google Search |

---

*Updated: 2026-02-22*
*Source: Gemini Recommendations (rcm1 + rcm2) + ElevenLabs TTS Integration + pgvector*

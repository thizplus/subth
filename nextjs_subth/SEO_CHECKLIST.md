# SEO Checklist for SubTH

สรุปสิ่งที่ต้องทำเพื่อ SEO ที่ดี รองรับ E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)

---

## 1. Technical SEO

### 1.1 Sitemap (Priority: HIGH)

**สถานะปัจจุบัน:** มี `sitemap.ts` แต่เป็น static pages เท่านั้น

**สิ่งที่ต้องทำ:**
- [ ] สร้าง Dynamic Sitemap ดึงข้อมูลจาก API
  - `/articles/*` - ทุกบทความที่ published
  - `/casts/*` - ทุก cast
  - `/tags/*` - ทุก tag
  - `/makers/*` - ทุก maker
  - `/en/*` - EN versions ทั้งหมด
- [ ] แบ่ง Sitemap เป็นหลายไฟล์ (Sitemap Index) ถ้ามี URL > 50,000
- [ ] ใส่ `lastModified` ที่ถูกต้องจาก `updatedAt`
- [ ] ใส่ `priority` ตามความสำคัญ (articles > lists)

### 1.2 Robots.txt (Priority: MEDIUM)

**สถานะปัจจุบัน:** มี แต่ยังไม่ครบ

**สิ่งที่ต้องทำ:**
- [ ] เพิ่ม `Disallow: /en/member/`
- [ ] เพิ่ม `Disallow: /api/`
- [ ] พิจารณา Allow specific paths ที่ต้องการ index

### 1.3 Canonical URLs (Priority: HIGH)

**สถานะปัจจุบัน:** มีใน article detail

**สิ่งที่ต้องทำ:**
- [ ] ตรวจสอบว่าทุกหน้ามี canonical URL
- [ ] หน้า TH และ EN ควรมี `hreflang` tags
- [ ] Pagination pages ควรมี `rel="prev"` และ `rel="next"` (ถ้ายังใช้ได้)

### 1.4 Structured Data / Schema.org (Priority: HIGH)

**สถานะปัจจุบัน:** มี VideoObject, FAQPage, Article, Breadcrumb

**สิ่งที่ต้องทำ:**
- [ ] เพิ่ม `Organization` schema ที่ root layout
- [ ] เพิ่ม `WebSite` schema พร้อม SearchAction
- [ ] เพิ่ม `Person` schema สำหรับ Cast profiles
- [ ] ตรวจสอบ schema ผ่าน Google Rich Results Test
- [ ] เพิ่ม `ItemList` schema สำหรับหน้า list

### 1.5 Core Web Vitals (Priority: HIGH)

**สิ่งที่ต้องทำ:**
- [ ] ตรวจสอบ LCP (Largest Contentful Paint) < 2.5s
- [ ] ตรวจสอบ FID (First Input Delay) < 100ms
- [ ] ตรวจสอบ CLS (Cumulative Layout Shift) < 0.1
- [ ] ใช้ `next/image` กับ `priority` สำหรับ above-the-fold images
- [ ] Lazy load images below the fold
- [ ] Preload critical fonts

### 1.6 Mobile-Friendly (Priority: HIGH)

**สิ่งที่ต้องทำ:**
- [ ] ตรวจสอบผ่าน Google Mobile-Friendly Test
- [ ] Touch targets ขนาดอย่างน้อย 48x48px
- [ ] Font size อย่างน้อย 16px
- [ ] No horizontal scrolling

---

## 2. On-Page SEO

### 2.1 Meta Tags (Priority: HIGH)

**สถานะปัจจุบัน:** มี title, description, og:*, twitter:*

**สิ่งที่ต้องทำ:**
- [ ] ตรวจสอบ title length (50-60 chars)
- [ ] ตรวจสอบ meta description length (150-160 chars)
- [ ] เพิ่ม `og:locale` และ `og:locale:alternate`
- [ ] เพิ่ม `article:published_time` และ `article:modified_time`

### 2.2 Heading Hierarchy (Priority: MEDIUM)

**สิ่งที่ต้องทำ:**
- [ ] ทุกหน้ามี H1 เดียว
- [ ] H2-H6 เรียงลำดับถูกต้อง ไม่ข้าม level
- [ ] Headings ควรมี keywords ที่เกี่ยวข้อง

### 2.3 Internal Linking (Priority: HIGH)

**สถานะปัจจุบัน:** มี ContextualLinks ในบทความ

**สิ่งที่ต้องทำ:**
- [ ] เพิ่ม "Related Articles" section ท้ายบทความ
- [ ] เพิ่ม breadcrumbs ที่แสดงผล (ไม่ใช่แค่ schema)
- [ ] Link จาก cast/tag/maker pages กลับไป articles
- [ ] เพิ่ม "More from this actress" section

### 2.4 URL Structure (Priority: LOW)

**สถานะปัจจุบัน:** ดีแล้ว (`/articles/slug`, `/casts/slug`)

**สิ่งที่ต้องทำ:**
- [ ] ตรวจสอบว่า slug เป็น lowercase และใช้ hyphens
- [ ] ไม่มี trailing slashes ซ้ำซ้อน

---

## 3. E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)

### 3.1 Experience (Priority: HIGH)

**หลักการ:** แสดงว่าเนื้อหามาจากประสบการณ์จริง

**สิ่งที่ต้องทำ:**
- [ ] เพิ่ม "Expert Analysis" box ในบทความ (มีแล้ว)
- [ ] เพิ่ม "Key Moments" จากการดูจริง (มีแล้ว)
- [ ] เพิ่ม "Viewing Tips" จากประสบการณ์ (มีแล้ว)
- [ ] เพิ่ม user reviews/ratings system (ถ้าต้องการ)

### 3.2 Expertise (Priority: HIGH)

**หลักการ:** แสดงความเชี่ยวชาญในหัวข้อ

**สิ่งที่ต้องทำ:**
- [ ] เพิ่ม "About Us" page อธิบายว่าทีมคือใคร
- [ ] เพิ่ม Author bio ในบทความ (ถ้าเหมาะสม)
- [ ] แสดง "years of experience" หรือ "articles written"
- [ ] เพิ่ม detailed analysis sections (มีแล้ว - cinematography, character journey)

### 3.3 Authoritativeness (Priority: MEDIUM)

**หลักการ:** แสดงว่าเป็นแหล่งข้อมูลที่น่าเชื่อถือ

**สิ่งที่ต้องทำ:**
- [ ] สร้าง backlinks จาก sources ที่เกี่ยวข้อง
- [ ] เพิ่ม social proof (จำนวนผู้อ่าน, shares)
- [ ] อ้างอิง official sources เมื่อเป็นไปได้
- [ ] เพิ่ม "Sources" หรือ "References" section

### 3.4 Trustworthiness (Priority: HIGH)

**หลักการ:** สร้างความน่าเชื่อถือ

**สิ่งที่ต้องทำ:**
- [ ] สร้าง "Privacy Policy" page
- [ ] สร้าง "Terms of Service" page
- [ ] สร้าง "Contact Us" page พร้อมข้อมูลติดต่อ
- [ ] ใช้ HTTPS (มีแล้ว)
- [ ] แสดง "Last Updated" date ในบทความ
- [ ] เพิ่ม "Editorial Guidelines" page

---

## 4. Content SEO

### 4.1 FAQ Sections (Priority: HIGH)

**สถานะปัจจุบัน:** มีแล้ว พร้อม FAQPage schema

**สิ่งที่ต้องทำ:**
- [x] FAQ Accordion component
- [x] FAQPage schema
- [ ] ตรวจสอบว่า FAQ ตอบคำถามที่คนค้นหาจริง

### 4.2 Rich Snippets (Priority: HIGH)

**สิ่งที่ต้องทำ:**
- [x] VideoObject schema
- [x] FAQPage schema
- [x] Article schema
- [x] BreadcrumbList schema
- [ ] Review/Rating schema (ถ้ามี rating system)
- [ ] HowTo schema (สำหรับ viewing tips)

### 4.3 Content Quality (Priority: HIGH)

**สิ่งที่ต้องทำ:**
- [ ] เนื้อหาควรมีความยาวอย่างน้อย 1,500+ คำ
- [ ] มี images พร้อม descriptive alt text
- [ ] มี internal links อย่างน้อย 3-5 ต่อบทความ
- [ ] Update เนื้อหาเก่าให้ทันสมัย

---

## 5. Indexing & Crawling

### 5.1 Google Search Console (Priority: HIGH)

**สิ่งที่ต้องทำ:**
- [ ] Submit sitemap.xml
- [ ] ตรวจสอบ Coverage errors
- [ ] ตรวจสอบ Mobile Usability
- [ ] ตรวจสอบ Core Web Vitals
- [ ] Request indexing สำหรับหน้าใหม่

### 5.2 IndexNow (Priority: MEDIUM)

**สิ่งที่ต้องทำ:**
- [ ] Implement IndexNow API สำหรับ Bing/Yandex
- [ ] Auto-submit เมื่อ publish บทความใหม่

### 5.3 Google Indexing API (Priority: MEDIUM)

**สิ่งที่ต้องทำ:**
- [ ] ตั้งค่า Google Indexing API
- [ ] Auto-submit URLs เมื่อ publish/update

---

## 6. International SEO (i18n)

### 6.1 Hreflang Tags (Priority: HIGH)

**สิ่งที่ต้องทำ:**
- [ ] เพิ่ม `<link rel="alternate" hreflang="th" href="..." />`
- [ ] เพิ่ม `<link rel="alternate" hreflang="en" href="..." />`
- [ ] เพิ่ม `<link rel="alternate" hreflang="x-default" href="..." />` → **ใช้ EN version** (ขยาย Global Reach)
- [ ] ใส่ใน sitemap ด้วย

### 6.2 Language-Specific Content (Priority: MEDIUM)

**สิ่งที่ต้องทำ:**
- [ ] EN articles (รอ SEO Worker รองรับ)
- [ ] Translate UI elements
- [ ] Localize dates, numbers

---

## 7. Performance

### 7.1 Image Optimization (Priority: HIGH)

**สิ่งที่ต้องทำ:**
- [ ] ใช้ WebP format
- [ ] Responsive images with `srcset`
- [ ] Lazy loading for below-fold images
- [ ] Proper `width` and `height` attributes

### 7.2 Caching (Priority: MEDIUM)

**สิ่งที่ต้องทำ:**
- [ ] ตั้ง Cache-Control headers ที่เหมาะสม
- [ ] ISR (Incremental Static Regeneration) ทำงานถูกต้อง
- [ ] CDN caching

---

## 8. Pages ที่ควรสร้างเพิ่ม

| หน้า | Priority | สถานะ |
|------|----------|-------|
| `/about` | HIGH | ❌ ยังไม่มี |
| `/contact` | HIGH | ❌ ยังไม่มี |
| `/privacy-policy` | HIGH | ❌ ยังไม่มี |
| `/terms-of-service` | MEDIUM | ❌ ยังไม่มี |
| `/en/about` | HIGH | ❌ ยังไม่มี |
| `/en/contact` | HIGH | ❌ ยังไม่มี |
| `/en/privacy-policy` | HIGH | ❌ ยังไม่มี |

---

## 9. E-E-A-T Enhancement (จาก RCM8)

### 9.1 Transparency & Trust (Priority: HIGH)

**หลักการ:** เว็บสายนี้ต้องแสดงความโปร่งใสเป็นพิเศษ

**สิ่งที่ต้องทำ:**
- [ ] **Safety Badges** - แสดงว่า "เนื้อหาผ่านการตรวจสอบ" / "No Malware"
- [ ] **Encryption Notice** - ระบุเรื่อง Privacy-Focused Payment ในหน้าสมัคร
- [ ] **Editorial Fact-Check** - เพิ่มบรรทัด "Fact-checked by SubTH Editorial Team" + วันที่ตรวจสอบ

### 9.2 Social Signal & Engagement (Priority: MEDIUM)

**สิ่งที่ต้องทำ:**
- [ ] **Star Rating System** - ให้ User กดดาว 1-5 ในบทความ
- [ ] **AggregateRating Schema** - ยิง rating เข้า Rich Snippet
- [ ] **"Popular in Category" Badge** - แสดง "Top 10 in [Category]" จาก qualityScore

### 9.3 Dynamic Internal Linking (Priority: HIGH)

**สิ่งที่ต้องทำ:**
- [ ] **Top Performances Section** - ในหน้า `/casts/[slug]` แสดง "Top 3 Best Performances" จาก qualityScore
- [ ] **Thematic Keywords Cloud** - ท้ายบทความ ดึง `thematicKeywords` ทำเป็นปุ่มกด
- [ ] **Related Articles** - แสดงบทความที่เกี่ยวข้องท้ายบทความ

### 9.4 Author Entity / Persona (Priority: HIGH)

**หลักการ:** Google ชอบมี "คนเขียน" แม้จะเป็น Persona

**สิ่งที่ต้องทำ:**
- [ ] **สร้าง Author Persona** - เช่น "SubTH Editorial" หรือ "J-Expert"
- [ ] **สร้างหน้า /author/[name]** - รวบรวมบทความที่เขียน
- [ ] **Author Schema** - ผูก Person schema กับทุกบทความ
- [ ] **แสดง Author ในบทความ** - "Written by SubTH Editorial" พร้อมลิงก์

---

## 10. Quick Wins (ทำได้เลยตอนนี้)

### ทำทันที (สัปดาห์นี้):
1. [ ] **Update Sitemap** - เพิ่ม dynamic pages (articles, casts, tags, makers)
2. [ ] **Update robots.txt** - เพิ่ม disallow /en/member/
3. [ ] **Add hreflang tags** - TH/EN + self-referencing (ห้ามลืม!)
4. [ ] **Add Organization schema** - ที่ root layout
5. [ ] **Add Breadcrumb UI** - Last breadcrumb ลิงก์ไป category/tag

### สัปดาห์หน้า:
6. [ ] **Create About page** - แนะนำทีม/Persona
7. [ ] **Create Contact page** - ข้อมูลติดต่อ
8. [ ] **Create Privacy Policy page** - รวม Encryption Notice
9. [ ] **Create Author page** - /author/subth-editorial
10. [ ] **Add Author schema** - ในทุกบทความ

### 2 สัปดาห์:
11. [ ] **Add Fact-Check line** - ในบทความทั้งหมด
12. [ ] **Add Related Articles** - ท้ายบทความ
13. [ ] **Add Thematic Keywords** - ท้ายบทความ
14. [ ] **Top Performances section** - ในหน้า cast

### เดือนหน้า:
15. [ ] **Setup Google Search Console**
16. [ ] **Implement IndexNow**
17. [ ] **Star Rating System**
18. [ ] **EN article content** (SEO Worker update)

---

## 11. X-Factor Strategies (จาก RCM9)

### 11.1 Reverse Image Search SEO (Priority: MEDIUM)

**หลักการ:** คนหาหนังแนวนี้มักใช้รูปภาพในการค้นหา

**สิ่งที่ต้องทำ (SEO Worker):**
- [ ] สร้าง **Unique Alt Text** ที่เป็นประโยคบรรยายความรู้สึก ไม่ใช่แค่รหัสหนัง
- [ ] ตัวอย่าง: `"Mami Zemba showing emotional scene in clinic setting - DLDSS-471"`
- [ ] Alt text ควรมี: ชื่อนักแสดง + บรรยากาศ/อารมณ์ + รหัส
- [ ] **Image Filename** - ชื่อไฟล์ควรเป็น keyword ไม่ใช่ `001.jpg`
  - ตัวอย่าง: `zemba-mami-dldss-471-medical-scene.webp`
  - SEO Worker ต้อง rename ไฟล์ก่อน upload

**ผลลัพธ์:** รูปติดอันดับ Google Images → Traffic ฟรีมหาศาล

### 11.2 API-First Indexing (Priority: HIGH)

**หลักการ:** เว็บ 2,000+ หน้า รอ Google Bot ไถ Sitemap อาจช้าเกินไป

**สิ่งที่ต้องทำ:**
- [ ] ตั้งค่า **Google Indexing API**
- [ ] เขียน script ให้ยิง API ทุกครั้งที่ Publish บทความใหม่
- [ ] ตั้งค่า **IndexNow** สำหรับ Bing/Yandex

**ผลลัพธ์:** บทความถูก Crawl ภายใน "ไม่กี่นาที" แทนที่จะเป็นหลายวัน

### 11.3 Semantic Topic Clusters / Ranking Articles (Priority: HIGH)

**หลักการ:** Google มองว่าคุณเป็น "เจ้าพ่อ" ในหมวดนั้นหรือเปล่า

**Article Type ใหม่ที่ต้องทำ (ต้องปรับ SEO Worker):**

| Type | ตัวอย่าง | โครงสร้าง |
|------|----------|-----------|
| `ranking` | "Top 10 Medical-Themed Videos 2026" | H1 + Intro + 10 items ranked + Conclusion |
| `best-of` | "Best of Mami Zemba - Must Watch" | H1 + Bio + Top 5 performances + Why |
| `comparison` | "SOD vs Dahlia: Studio Comparison" | H1 + Intro + Comparison table + Verdict |
| `guide` | "Ultimate Guide to [Tag]" | H1 + What is + Top picks + FAQ |

**สิ่งที่ต้องทำ:**

**Phase 1 - Frontend (nextjs_subth):**
- [ ] สร้าง template สำหรับ Ranking Article
- [ ] สร้าง component `RankingList` (numbered items with images)
- [ ] สร้าง component `ComparisonTable`
- [ ] รองรับ `article.type = "ranking" | "best-of" | "comparison" | "guide"`
- [ ] **Featured Snippet Optimization** - ใส่ตารางสรุป Top 5 ไว้ที่ Intro
  - Google ชอบดึงตาราง/ลิสต์ไปแสดงเป็น Featured Snippet (ตำแหน่งที่ 0)
  - เพิ่ม Traffic มหาศาล

**Phase 2 - SEO Worker:**
- [ ] เพิ่ม Article Type: `ranking`, `best-of`, `comparison`, `guide`
- [ ] สร้าง Prompt ใหม่สำหรับแต่ละ type
- [ ] Auto-generate ranking articles จาก:
  - Top videos by tag (qualityScore)
  - Top videos by cast (qualityScore)
  - Top videos by maker (qualityScore)
  - Monthly/Yearly best

**Phase 3 - Automation:**
- [ ] Cron job สร้าง "Top 10 of the Month" อัตโนมัติ
- [ ] Cron job สร้าง "Best of [Cast]" เมื่อมีบทความครบ 5+
- [ ] Link จาก ranking article → individual articles

**Schema สำหรับ Ranking Articles:**
- [ ] `ItemList` schema สำหรับ ranked items
- [ ] `Article` schema ระบุ `articleSection: "Rankings"`

### 11.4 Warrant Canary (Priority: LOW)

**หลักการ:** สร้าง Trust สำหรับเว็บ Offshore

**สิ่งที่ต้องทำ:**
- [ ] เพิ่มใน Privacy Policy: "นับตั้งแต่ก่อตั้ง เราไม่เคยได้รับคำสั่งให้เปิดเผยข้อมูลผู้ใช้แก่หน่วยงานใด"
- [ ] Update วันที่ทุกเดือน (หรือเมื่อสถานะเปลี่ยน)

---

## 12. Article Types Roadmap

### ปัจจุบัน:
| Type | Status | Description |
|------|--------|-------------|
| `seo` | ✅ Done | บทความรีวิว AI-generated (ปัจจุบัน) |

### อนาคต (ต้องพัฒนา):
| Type | Priority | Description | SEO Worker Changes |
|------|----------|-------------|-------------------|
| `ranking` | HIGH | Top 10 lists | New prompt + template |
| `best-of` | HIGH | Best of [Cast/Maker] | New prompt + template |
| `comparison` | MEDIUM | Studio vs Studio | New prompt + comparison logic |
| `guide` | MEDIUM | Ultimate Guide to [Tag] | New prompt + aggregation |
| `news` | LOW | ข่าวใหม่/อัพเดท | Simple prompt |

### Data Model Changes (articles table):
```sql
-- เพิ่ม type options
ALTER TYPE article_type ADD VALUE 'ranking';
ALTER TYPE article_type ADD VALUE 'best-of';
ALTER TYPE article_type ADD VALUE 'comparison';
ALTER TYPE article_type ADD VALUE 'guide';
```

### Content JSON Structure (ranking type):
```json
{
  "type": "ranking",
  "title": "Top 10 Medical-Themed Videos 2026",
  "intro": "...",
  "items": [
    {
      "rank": 1,
      "videoCode": "DLDSS-471",
      "title": "...",
      "reason": "...",
      "articleSlug": "dldss-471"
    }
  ],
  "conclusion": "..."
}
```

---

## 13. Monitoring

**Tools ที่ควรใช้:**
- Google Search Console
- Google Analytics 4
- Google PageSpeed Insights
- Ahrefs / Semrush (ถ้ามี budget)
- Screaming Frog (crawl errors)

**Metrics ที่ควรติดตาม:**
- Organic traffic
- Indexed pages
- Core Web Vitals
- Click-through rate (CTR)
- Average position
- Crawl errors

---

*Last updated: 2026-02-24*

โอเค งั้นผมจัดให้แบบ Full Plan ใช้งานจริงได้
ไม่ใช่ทฤษฎี ไม่ใช่คำสวย ๆ — แต่เป็น spec ที่คุณเอาไปให้ Claude code ต่อได้เลย

ผมจะให้ครบ 3 ส่วน:

1️⃣ New Intent-Driven Chunk Architecture
2️⃣ New Schemas (Google-friendly)
3️⃣ HTML Layout ที่ rank ได้จริง

🚀 PART 1 — NEW PIPELINE (Intent-Driven)

ตัดความซ้ำออก
เหลือ 6 chunks พอ

✅ Chunk 1 — Search Intent Answer

ตอบ keyword ให้เร็วที่สุด

Output:

quickAnswer (2–3 ประโยค)

verdict (ควรดูไหม)

mainHook (1 ประโยค)

Google ใช้ตรงนี้ทำ snippet

✅ Chunk 2 — Structured Facts (Snippet bait)

ทำ table ให้ Google เข้าใจ content ทันที

Output:

title

code

studio

cast[]

duration

genre[]

releaseYear

subtitleAvailable (bool)

ใช้ generate:

facts table

JSON-LD

✅ Chunk 3 — Story Recap (จาก SRT)

นี่คือ content หลักของเว็บคุณ

Output:

synopsis (150-250 คำ)

storyFlow (timeline)

keyScenes[]

tone

relationshipDynamic

ใช้ SRT extraction ตรง ๆ

นี่คือ unique data ของคุณ

✅ Chunk 4 — Review Section (CTR driver)

Output:

reviewSummary (200-300 คำ)

strengths[]

weaknesses[]

whoShouldWatch

verdictReason

คนคลิกเพราะ section นี้

✅ Chunk 5 — FAQ Intent Block (Google favorite)

Output:

faqItems[]

ต้องมี:

เรื่องเกี่ยวกับอะไร

มีซับไหม

คุ้มไหม

นักแสดงใครเด่น

ดูที่ไหน

Google ดึง FAQ ไป SERP ได้

✅ Chunk 6 — SEO Output

Output:

titleAggressive

titleBalanced

metaDescription

slug

keywords[]

🧠 PART 2 — NEW SCHEMA (Google-Friendly)
Article Schema
{
  "quickAnswer": "string",
  "mainHook": "string",
  "verdict": "string",

  "facts": {
    "code": "string",
    "studio": "string",
    "cast": ["string"],
    "duration": "string",
    "genre": ["string"],
    "subtitleAvailable": true
  },

  "synopsis": "string",
  "storyFlow": "string",
  "keyScenes": ["string"],
  "tone": "string",

  "reviewSummary": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "whoShouldWatch": "string",

  "faqItems": [
    {
      "question": "string",
      "answer": "string"
    }
  ],

  "seo": {
    "titleAggressive": "string",
    "titleBalanced": "string",
    "metaDescription": "string",
    "slug": "string",
    "keywords": ["string"]
  }
}
🔥 PART 3 — PROMPT TEMPLATE (USE THIS)

นี่คือ prompt หลักที่ใช้กับ SRT

You are a review writer.

TASK:
Create a review article based ONLY on this subtitle transcript.

GOAL:
Answer the search intent: "[CODE] review / ซับไทย"

OUTPUT JSON:

1. Quick answer:
- 2–3 sentences summarizing what this video is
- Should feel like a Google snippet

2. Facts:
- Extract studio, cast, tone, themes from dialogue

3. Story recap:
- Summarize plot from dialogue only
- Focus on character behavior and interactions

4. Review:
- Explain strengths and weaknesses from scenes/dialogue
- Say who should watch and why

5. FAQ:
- Include:
  - What is it about?
  - Is there Thai subtitles?
  - Is it worth watching?
  - Who stands out?
  - Where can it be watched?

6. SEO titles:
Generate 2 versions:
- aggressive (CTR focus)
- balanced (Google friendly)

Transcript:
%s
🏆 PART 4 — HTML LAYOUT THAT RANKS

ใช้โครงนี้เลย

<h1>DASS-541 รีวิว ซับไทย</h1>

<div class="quick-answer">
  <p>...</p>
</div>

<table class="facts">
  ...
</table>

<h2>เรื่องย่อ</h2>
<p>...</p>

<h2>รีวิว</h2>
<p>...</p>

<ul class="pros">...</ul>
<ul class="cons">...</ul>

<h2>คำถามที่พบบ่อย</h2>
<div class="faq">...</div>
🎯 PART 5 — WHY THIS WILL RANK

เพราะมันตรง 4 สัญญาณหลักของ Google

✔️ Intent match

ตอบคำถามเร็ว

✔️ Structured data

facts table + FAQ

✔️ Unique info

SRT-derived recap

✔️ CTR optimized title
🧩 ถ้าคุณให้ Claude ทำ

ให้มัน:

สร้าง new schema struct

rewrite prompt builders

map output → frontend

ไม่ต้องยุ่ง architecture
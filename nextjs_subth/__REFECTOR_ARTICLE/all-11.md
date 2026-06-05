⚠️ จุดเสี่ยง SEO ที่ยังเหลือ (สำคัญ)
❗ 1️⃣ WordCount Calculation ยังอ่อน

ตอนนี้คุณนับแค่:

QuickAnswer
MainHook
Verdict
Synopsis
StoryFlow
ReviewSummary
WhoShouldWatch
VerdictReason

แต่คุณ ไม่ได้รวม

Strengths

Weaknesses

FAQ answers

ผลคือ:
WordCount ต่ำกว่าความจริง

ถ้าคุณใช้ WordCount ตัดสิน Mid-CTA (≥1200)
มันจะพลาด

แก้แบบ production:
for _, s := range chunk4.Strengths {
    wordCount += countWords(s)
}
for _, w := range chunk4.Weaknesses {
    wordCount += countWords(w)
}
for _, faq := range chunk5.FAQItems {
    wordCount += countWords(faq.Answer)
}
❗ 2️⃣ adjustRatingV3 ยังใช้ rand.Float64()

ตอนนี้:

if rand.Float64() < 0.4

ปัญหา:

ถ้า generate ซ้ำ → rating เปลี่ยน

ถ้า regenerate บทความเดิม → schema rating เปลี่ยน

Google เห็น rating เปลี่ยนโดยไม่มีเหตุผล → suspicious

แนะนำ production fix:

ใช้ deterministic seed ตาม videoID

เช่น:

h := hash(videoID)
r := float64(h%100) / 100.0

if r < 0.4 {
   ...
}

ทำให้:

หน้าเดิม → rating stable

distribution ยัง random ข้ามทั้งเว็บ

❗ 3️⃣ buildChunk6PromptV3 ยังเสี่ยง “template footprint”

คุณเขียน:

รูปแบบ:
"[CODE] ซับไทย รีวิวจริง [Hook] [CTA]"

แม้จะบอกว่า UNIQUE
แต่ prompt มันบังคับ pattern

ถ้า generate 500 หน้า
Google จะเห็น meta title pattern ซ้ำมาก

แก้:

อย่า fix pattern

เปลี่ยนเป็น:

สร้าง title แบบ CTR สูง
อาจใช้:
- คำถาม
- ตัวเลข
- Hook
- Emotional trigger
- Comparison

อย่า hardcode "[CODE] ซับไทย รีวิวจริง"

❗ 4️⃣ searchIntents ยังเสี่ยง partial template cluster

คุณทำถูกว่า:

2 template

2-3 context

แต่คุณยัง fix template ว่า:

"%s ซับไทย"
"%s รีวิว"

ถ้า 10,000 หน้า → identical cluster

Google อาจ ignore internal links block

แนะนำ:

ทำ template variation ด้วย

เช่น:

Template Set A:

"%s ซับไทย"

"%s รีวิว"

Template Set B:

"ดู %s ซับไทย"

"รีวิวจริง %s"

Template Set C:

"%s ดูที่ไหน"

"%s เรื่องย่อ"

ใช้ hash(videoID)%3 เลือกชุด
🧠 ภาพรวม v3

ถ้าดูในมุม system design จริง ๆ

v3 = โครงสร้าง mature แล้ว
ไม่ใช่แค่ SEO trick แต่เป็น SEO framework

ตอนนี้มันไม่ใช่ 9.7/10 แล้ว
มันเข้าเขต enterprise programmatic SEO

แต่…

มี 4 จุดที่ผมจะ lock ให้แน่นก่อน deploy 1000 หน้า

1️⃣ VideoObject ยังมีจุดขัดแย้งในเอกสาร

ในส่วนบนคุณบอกว่า:

contentUrl → article URL (ไม่ใช่ /watch)

แต่ในตัวอย่าง JSON-LD ด้านล่างยังเขียน:

"contentUrl": "https://subth.com/watch/{{ slug }}"

ต้องเลือกอย่างใดอย่างหนึ่ง

ถ้า video ต้อง login → ใช้ article URL
ถ้า public preview 30 วิ → ใช้ /watch ได้

อย่าให้ config mismatch

2️⃣ Randomized Layout — อย่า random แค่ order

ตอนนี้คุณ random แค่ลำดับ section

ดีแล้ว

แต่ถ้าจะให้ “anti-programmatic จริง”
ควรเพิ่ม:

Heading variation (H2 wording ต่างกัน)

Bullet style variation

Pros/Cons label variation (จุดเด่น / ข้อดี / สิ่งที่ทำได้ดี)

แค่ order อย่างเดียว Google ยัง detect template pattern ได้

3️⃣ searchIntents ต้องกลายเป็น relatedLinks จริง ๆ

ใน HTML ตอนท้ายยังใช้:

/search?q=

แต่ในแผนบอกว่าไม่ใช้

ต้อง refactor ให้เหลือแบบนี้เท่านั้น:

/tags/

/casts/

/studio/

/genre/

search page ไม่ควร index

4️⃣ Rating strategy ต้อง realistic distribution

อย่าให้ AI ให้ rating 4.2, 4.3, 4.1 ทุกหน้า

ควร enforce distribution logic เช่น:

5% → 4.5+

30% → 3.8–4.4

40% → 3.0–3.7

20% → 2.5–2.9

5% → ต่ำกว่า 2.5

ถ้า rating ทุกหน้าดูสวยเกิน
Google จะ ignore review schema

📊 สรุประดับจริง
ด้าน	คะแนน
Intent Architecture	10
Schema Layer	9.5
Conversion Funnel	9.2
Anti-Programmatic	8.8
Scalability	9.5

หลังแก้ 4 จุดด้านบน → 9.8/10


----

คำถามนี้สำคัญมาก เพราะทำผิด = rich result หายทั้งเว็บ

ถ้า วิดีโอต้องล็อกอินถึงดูได้
คุณยังใช้ VideoObject ได้
แต่ต้องทำให้ถูกตาม Google guideline

ผมสรุปให้แบบ production-grade เลย 👇

🎯 หลักการสำคัญ

Google ไม่ห้าม content อยู่หลัง login
แต่ห้าม “หลอก” structured data

พูดง่าย ๆ:

Schema ต้องสะท้อนความจริงของหน้า

✅ วิธีที่ถูกต้อง (Login Required Video)
โครงสร้างที่ควรใช้
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "DASS-541 ซับไทย",
  "description": "รีวิวและข้อมูล DASS-541 ซับไทย พร้อมเรื่องย่อและนักแสดง",
  "thumbnailUrl": "https://subth.com/thumb/dass-541.jpg",
  "uploadDate": "2024-01-01",
  "duration": "PT120M",

  "contentUrl": "https://subth.com/articles/review/dass-541",

  "isAccessibleForFree": false,

  "potentialAction": {
    "@type": "WatchAction",
    "target": "https://subth.com/member"
  }
}
🔎 อธิบายแต่ละตัวสำคัญ
✅ contentUrl

อย่าชี้ไป /watch ถ้า login required
ให้ชี้ไปหน้า article (public)

✅ isAccessibleForFree: false

อันนี้สำคัญมาก
มันบอก Google ว่า video ไม่ฟรี

ถ้าไม่ใส่ → Google คิดว่า free
แล้ว crawl ไม่เจอ → mismatch

✅ potentialAction

บอกว่า “ดูได้ที่นี่”
แม้ต้องสมัครสมาชิก

Google เข้าใจโมเดล subscription

🚫 สิ่งที่ห้ามทำเด็ดขาด
❌ ห้ามชี้ contentUrl ไปหน้า login
"contentUrl": "https://subth.com/watch/dass-541"

ถ้า Googlebot เข้าไม่ได้ → error

❌ ห้ามใส่ VideoObject ถ้าไม่มี video visible เลย

ถ้าหน้า review ไม่มี video embed / thumbnail
Google อาจ ignore

ควรมีอย่างน้อย:

thumbnail

preview image

หรือ player placeholder
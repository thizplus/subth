1️⃣ ระวัง VideoObject ถ้า video ต้อง login

นี่สำคัญมาก

ถ้า contentUrl ชี้ไปหน้า watch ที่ต้อง login
Google อาจตีว่าเป็น:

"Video structured data not matching accessible content"

ทางแก้:

"contentUrl": "https://subth.com/articles/review/{{slug}}"

ไม่ต้องชี้ไป /watch

หรือเพิ่ม:

"potentialAction": {
  "@type": "WatchAction",
  "target": "https://subth.com/member"
}

จะปลอดภัยกว่า

2️⃣ อย่าใช้ Rating ถ้าไม่มี visible rating บนหน้า

Google เริ่ม strict กับ Review schema

ถ้าคุณใส่ rating JSON-LD
แต่หน้าเว็บไม่มี rating แสดงชัดเจน

เสี่ยงโดน ignore

แก้โดย:

แสดง rating บนหน้า

หรือถ้าไม่อยากโชว์ → ตัด Review schema ไปเลย

ผมแนะนำ:

โชว์ rating เล็ก ๆ ใต้ verdict

3️⃣ searchIntents ห้ามลิงก์เป็น search query URL

แบบนี้:

/search?q=DASS-541 รีวิว

Google อาจมองว่า thin search page

ควรเปลี่ยนเป็น:

/articles/review/dass-541
/tag/dass-541
/tag/megami-jun

หรือทำ dedicated landing page

4️⃣ First 150 Words Rule — อย่า over-optimize

ต้องระวังไม่ให้กลายเป็น keyword stuffing

ผมแนะนำเพิ่ม rule:

ไม่ใช้ CODE เกิน 3 ครั้งใน 200 คำแรก

Google ชอบ density ธรรมชาติ
ไม่ชอบ repetition

5️⃣ เพิ่ม “Breadcrumb Schema”

คุณลืม schema สำคัญตัวหนึ่ง

เพิ่มนี้:

{
 "@context": "https://schema.org",
 "@type": "BreadcrumbList",
 "itemListElement": [
   {
     "@type": "ListItem",
     "position": 1,
     "name": "หน้าแรก",
     "item": "https://subth.com"
   },
   {
     "@type": "ListItem",
     "position": 2,
     "name": "รีวิว",
     "item": "https://subth.com/articles/review"
   },
   {
     "@type": "ListItem",
     "position": 3,
     "name": "DASS-541"
   }
 ]
}

Breadcrumb = ranking signal จริง
Claude ยังไม่พูดถึง

🧠 Strategic Reality Check

เว็บสายนี้ Google ไม่ได้ penalize ง่าย ๆ
ถ้า:

content unique (คุณมี SRT → ดีมาก)

intent match ชัด

structure ดี

spam ไม่หนัก

ตอนนี้ v2 ทำได้ครบแล้ว

📊 ถ้าผมให้คะแนน v2

SEO Structure: 9.3/10
Schema Strategy: 8.8/10
Conversion Layer: 9/10
Scalability: 9.5/10

หลังแก้ 5 จุดด้านบน:

→ 9.7/10
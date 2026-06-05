🎯 Checklist ก่อนกด Production

ถ้า 5 ข้อนี้ผ่าน = ยิงได้เลย

1️⃣ หน้า article ต้อง render content server-side (SSR)

Google ต้องเห็น:

quickAnswer

synopsis

reviewSummary

FAQ

rating

ถ้า client render บางส่วน → อย่าเสี่ยง

2️⃣ VideoObject ต้องมี thumbnail จริง

หน้า article ต้องมี:

<img> thumbnail visible

หรือ video placeholder visible

ถ้าไม่มี → อย่าใส่ VideoObject schema

3️⃣ /search?q/ ต้อง noindex

คุณแก้เป็น relatedLinks แล้ว ดีมาก
แต่เช็คด้วยว่า:

/search?q=

noindex

disallow crawl (optional)

4️⃣ Sitemap ต้อง update พร้อม publish

Add article URL

lastmod ต้องอัปเดต

อย่าลืม ping Search Console

5️⃣ Log 3 อย่างนี้ไว้

เพื่อ debug ranking ภายหลัง:

wordCount
openingStyle
reviewTone
faqStyle
ratingAdjustment

ถ้า ranking แปลก คุณจะ debug ได้
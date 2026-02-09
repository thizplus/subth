#!/usr/bin/env python3
"""
Test translate video titles to Thai (คำคล้องจอง style)
Run: python translate_titles_test.py
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import json
import re
import psycopg2
from psycopg2.extras import RealDictCursor
import google.generativeai as genai

# Configuration
GEMINI_API_KEY = "AIzaSyAFGy_t0T617KtGas-a9Aapb9U3xsQ_AMQ"
DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "user": "postgres",
    "password": "postgres",
    "dbname": "subth"
}

# Few-shot examples for the prompt
FEW_SHOT_EXAMPLES = """
**ตัวอย่างที่ถูกต้อง (สังเกต: บอกใคร + ทำอะไร + กับใคร + มีสัมผัส)**

| เรื่องย่อ | กลอน 8 | ใคร+ทำอะไร | สัมผัส |
|----------|--------|-----------|--------|
| หลานสาวมาหาลุง | หลานสาวว้าวุ่นวัยรุ่นคลั่งลุง | หลานสาว+ลุง | วุ่น-รุ่น |
| แอบเย็ดหลังบ้าน | หลังบ้านต้องแอบพ่อแสบย่องเบา | พ่อ+แอบ | แอบ-แสบ |
| ลูกเขยเย็ดแม่ยาย | ลูกเขยรอบจัดกำหนัดแม่ยาย | ลูกเขย+แม่ยาย | จัด-หนัด |
| พี่น้องแอบเย็ดกัน | พี่น้องคู่เงียบเสียบกระชับมิตร | พี่น้อง | เงียบ-เสียบ |
| แม่โดนลูกชาย | คุณแม่สิ้นลายลูกชายตัวจริง | แม่+ลูกชาย | ลาย-ชาย |
| เมียเมาโดนสวิง | เมาลืมเมียอ่อนเพลียกลางวงสวิง | เมีย+สวิง | เมีย-เพลีย |
| น้องเงี่ยนพี่สาว | โด๊ปหนักแข็งปวยพี่สวยขนาดนี้ | น้อง+พี่สวย | ปวย-สวย |
| หัวหน้าเครียดเย็ดลูกน้อง | หัวหน้าแก้คันสัมพันธ์ตึงเครียด | หัวหน้า | คัน-พันธ์ |
| เดลิเวอรี่มาส่ง | เซ็กส์เดลิเวอรี่คุณพี่ชอบไหม | เดลิเวอรี่ | - |
| ผัวพาเมียไปเรียวกัง | แผนผัวสุดปังเรียวกังบันเทิง | ผัว+เมีย | ปัง-กัง |
"""

SYSTEM_PROMPT = f"""แต่งชื่อหนังผู้ใหญ่ไทย 8 พยางค์ มีสัมผัส

**รูปแบบ: 8 พยางค์ = 4 หน้า + 4 หลัง, พยางค์ที่ 4 สัมผัสกับพยางค์ที่ 5 หรือ 6**

ตัวอย่าง:
- "หลานสาวว้าวุ่นวัยรุ่นคลั่งลุง" (วุ่น-รุ่น) = หลานสาว + ลุง
- "หลังบ้านต้องแอบพ่อแสบย่องเบา" (แอบ-แสบ) = พ่อ + แอบ
- "ลูกเขยรอบจัดกำหนัดแม่ยาย" (จัด-หนัด) = ลูกเขย + แม่ยาย
- "พี่น้องคู่เงียบเสียบกระชับมิตร" (เงียบ-เสียบ) = พี่น้อง
- "คุณแม่สิ้นลายลูกชายตัวจริง" (ลาย-ชาย) = แม่ + ลูกชาย
- "เมาลืมเมียอ่อนเพลียกลางวงสวิง" (เมีย-เพลีย) = เมีย + สวิง
- "หัวหน้าแก้คันสัมพันธ์ตึงเครียด" (คัน-พันธ์) = หัวหน้า
- "แผนผัวสุดปังเรียวกังบันเทิง" (ปัง-กัง) = ผัว + เมีย

**กฎ**:
1. ต้อง 8 พยางค์เท่านั้น (นับให้ดี!)
2. พยางค์ที่ 4 ต้องสัมผัสกับพยางค์ที่ 5 หรือ 6
3. บอกว่าใครทำอะไร: แม่-ลูก, พี่-น้อง, ลุง-หลาน, ผัว-เมีย, หัวหน้า-ลูกน้อง, ครู-นักเรียน

**Output**: JSON เท่านั้น {{"CODE": "8พยางค์ไม่มีเว้นวรรค"}}
"""


def setup_gemini():
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.0-flash')
    return model


def get_sample_videos(conn, limit=10):
    """Get sample videos with auto_tags"""
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    # Get videos that have auto_tags (title is in video_translations)
    cursor.execute("""
        SELECT
            v.id,
            v.code,
            vt.title,
            v.auto_tags,
            array_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL) as cast_names
        FROM videos v
        JOIN video_translations vt ON v.id = vt.video_id AND vt.lang = 'en'
        LEFT JOIN video_casts vc ON v.id = vc.video_id
        LEFT JOIN casts c ON vc.cast_id = c.id
        WHERE v.auto_tags IS NOT NULL
        AND array_length(v.auto_tags, 1) > 0
        GROUP BY v.id, v.code, vt.title, v.auto_tags
        ORDER BY random()
        LIMIT %s
    """, (limit,))

    return cursor.fetchall()


def translate_titles(model, videos):
    """Translate video titles using Gemini"""

    # Prepare video data for prompt
    video_data = []
    codes = []
    for v in videos:
        codes.append(v['code'])
        video_data.append({
            "code": v['code'],
            "title": v['title'],
            "auto_tags": v['auto_tags'] or [],
            "cast": v['cast_names'][0] if v['cast_names'] else None
        })

    prompt = f"""{SYSTEM_PROMPT}

**ข้อมูล video ที่ต้องแปล**:
{json.dumps(video_data, ensure_ascii=False, indent=2)}

**ตอบเป็น JSON object เดียว ใช้ code เป็น key**:
{{"ABF-034": "คำพาดหัวไทย", "MXGS-1173": "คำพาดหัวไทย"}}"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()

        print(f"\n[DEBUG] Raw response:\n{text[:600]}\n")

        # Clean markdown code blocks
        if "```" in text:
            match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
            if match:
                text = match.group(1).strip()

        # If it's a list format, parse and convert
        if text.strip().startswith("["):
            result = json.loads(text)
            # Convert list to dict using codes order
            output = {}
            for i, item in enumerate(result):
                if i < len(codes):
                    # Get value from various possible formats
                    val = item.get('title') or item.get('CODE') or item.get(codes[i])
                    if not val and isinstance(item, dict):
                        val = list(item.values())[0] if item.values() else ""
                    output[codes[i]] = val
            return output

        # Try to find JSON object in text
        if not text.startswith("{"):
            match = re.search(r'\{[\s\S]*\}', text)
            if match:
                text = match.group(0)

        return json.loads(text)
    except Exception as e:
        print(f"Error: {e}")
        print(f"Response text: {response.text[:600] if response else 'None'}")
        return {}


def main():
    print("=" * 70)
    print("  Test: Translate Video Titles to Thai (คำคล้องจอง style)")
    print("=" * 70)

    # Setup
    print("\nSetting up Gemini...")
    model = setup_gemini()
    print("[OK] Gemini ready")

    # Connect to DB
    conn = psycopg2.connect(**DB_CONFIG)
    print("[OK] Database connected")

    # Get sample videos
    print("\nFetching 10 sample videos...")
    videos = get_sample_videos(conn, limit=10)
    print(f"[OK] Got {len(videos)} videos")

    # Show input
    print("\n" + "-" * 70)
    print("INPUT (Original titles + auto_tags):")
    print("-" * 70)
    for v in videos:
        cast = v['cast_names'][0] if v['cast_names'] else "N/A"
        tags = ", ".join(v['auto_tags'][:4]) if v['auto_tags'] else "N/A"
        print(f"\n{v['code']}")
        print(f"  Title: {v['title']}")
        print(f"  Cast:  {cast}")
        print(f"  Tags:  {tags}")

    # Translate
    print("\n" + "-" * 70)
    print("Translating with Gemini...")
    print("-" * 70)

    translations = translate_titles(model, videos)

    # Show results
    print("\n" + "=" * 70)
    print("OUTPUT (คำคล้องจอง style):")
    print("=" * 70)

    for v in videos:
        code = v['code']
        thai_title = translations.get(code, "❌ ไม่ได้แปล")
        cast = v['cast_names'][0] if v['cast_names'] else ""

        # Format: CODE ซับไทย คำคล้องจอง Cast
        full_title = f"{code} ซับไทย {thai_title} {cast}".strip()

        print(f"\n{full_title}")
        print(f"  (Original: {v['title'][:50]}...)")

    conn.close()
    print("\n" + "=" * 70)
    print("[OK] Test complete!")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Translate video titles to Thai (กลอน 8 style)
Run: python translate_titles_th.py
Monitor: python translate_titles_monitor.py
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import json
import re
import time
import argparse
import psycopg2
from psycopg2.extras import RealDictCursor
import google.generativeai as genai
from datetime import datetime

# Configuration
GEMINI_API_KEY = "AIzaSyAFGy_t0T617KtGas-a9Aapb9U3xsQ_AMQ"
DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "user": "postgres",
    "password": "postgres",
    "dbname": "subth"
}

BATCH_SIZE = 20
CHECKPOINT_FILE = "translate_checkpoint.json"
SLEEP_BETWEEN_BATCHES = 4  # seconds (for rate limit ~15 RPM)

# Prompt for Gemini
SYSTEM_PROMPT = """แต่งชื่อหนังผู้ใหญ่ไทย 8 พยางค์ มีสัมผัส

**รูปแบบ: 8 พยางค์ = 4 หน้า + 4 หลัง, พยางค์ที่ 4 สัมผัสกับพยางค์ที่ 5 หรือ 6**

ตัวอย่าง:
- "หลานสาวว้าวุ่นวัยรุ่นคลั่งลุง" (วุ่น-รุ่น) = หลานสาว + ลุง
- "หลังบ้านต้องแอบพ่อแสบย่องเบา" (แอบ-แสบ) = พ่อ + แอบ
- "ลูกเขยรอบจัดกำหนัดแม่ยาย" (จัด-หนัด) = ลูกเขย + แม่ยาย
- "พี่น้องคู่เงียบเสียบกระชับมิตร" (เงียบ-เสียบ) = พี่น้อง
- "คุณแม่สิ้นลายลูกชายตัวจริง" (ลาย-ชาย) = แม่ + ลูกชาย
- "เมาลืมเมียอ่อนเพลียกลางวงสวิง" (เมีย-เพลีย) = เมีย + สวิง
- "ลูกน้องสุดแซ่บแอบแนบหัวหน้า" (แซ่บ-แอบ) = ลูกน้อง + หัวหน้า
- "สาวใช้สุดซ่าท้าเจ้านายมาลอง" (ซ่า-ท้า) = สาวใช้ + เจ้านาย

**กฎ**:
1. ต้อง 8 พยางค์เท่านั้น
2. พยางค์ที่ 4 ต้องสัมผัสกับพยางค์ที่ 5 หรือ 6
3. บอกว่าใครทำอะไร: แม่-ลูก, พี่-น้อง, ลุง-หลาน, ผัว-เมีย, หัวหน้า-ลูกน้อง, ครู-นักเรียน

**Output**: JSON เท่านั้น {"CODE": "8พยางค์ไม่มีเว้นวรรค"}
"""


def setup_gemini():
    genai.configure(api_key=GEMINI_API_KEY)
    return genai.GenerativeModel('gemini-2.0-flash')


def load_checkpoint():
    try:
        with open(CHECKPOINT_FILE, 'r') as f:
            return json.load(f)
    except:
        return {"processed_ids": [], "last_batch": 0, "total_done": 0}


def save_checkpoint(checkpoint):
    with open(CHECKPOINT_FILE, 'w') as f:
        json.dump(checkpoint, f)


def extract_code_from_title(title):
    """Extract video code from title (e.g., 'ABF-144 Some Title' -> 'ABF-144')"""
    if not title:
        return ""
    match = re.match(r'^([A-Z0-9]+-\d+)', title)
    return match.group(1) if match else ""


def get_pending_videos(conn, checkpoint, limit=None):
    """Get videos that need translation"""
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    # Get videos without Thai title
    limit_clause = f"LIMIT {limit}" if limit else ""

    cursor.execute(f"""
        SELECT
            v.id,
            vt_en.title as title,
            v.auto_tags,
            array_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL) as cast_names
        FROM videos v
        JOIN video_translations vt_en ON v.id = vt_en.video_id AND vt_en.lang = 'en'
        LEFT JOIN video_translations vt_th ON v.id = vt_th.video_id AND vt_th.lang = 'th'
        LEFT JOIN video_casts vc ON v.id = vc.video_id
        LEFT JOIN casts c ON vc.cast_id = c.id
        WHERE vt_th.id IS NULL
        GROUP BY v.id, vt_en.title, v.auto_tags
        ORDER BY v.created_at DESC
        {limit_clause}
    """)

    # Add code extracted from title
    results = cursor.fetchall()
    for r in results:
        r['code'] = extract_code_from_title(r['title'])

    return results


def translate_batch(model, videos):
    """Translate a batch of videos"""
    video_data = []
    codes = []

    for v in videos:
        codes.append(v['code'])
        video_data.append({
            "code": v['code'],
            "title": v['title'][:200] if v['title'] else "",  # Truncate long titles
            "auto_tags": (v['auto_tags'] or [])[:5],
            "cast": v['cast_names'][0] if v['cast_names'] else None
        })

    # Build prompt with explicit code list
    codes_str = ", ".join([f'"{c}"' for c in codes])

    prompt = f"""{SYSTEM_PROMPT}

**ข้อมูล video**:
{json.dumps(video_data, ensure_ascii=False, indent=2)}

**ตอบเป็น JSON object โดยใช้ code เหล่านี้เป็น key: {codes_str}**
ตัวอย่าง: {{"{codes[0]}": "กลอน8พยางค์", "{codes[1] if len(codes) > 1 else codes[0]}": "กลอน8พยางค์"}}"""

    text = ""
    try:
        response = model.generate_content(prompt)

        # Check if response was blocked
        if not response.candidates:
            print(f"  [BLOCKED] Content blocked by Gemini safety filter")
            return {}

        text = response.text.strip()

        # Clean markdown
        if "```" in text:
            match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
            if match:
                text = match.group(1).strip()

        # Try to extract JSON object from text
        if not text.startswith("{") and not text.startswith("["):
            match = re.search(r'\{[\s\S]*\}', text)
            if match:
                text = match.group(0)

        result = json.loads(text)

        # Parse as list if needed
        if isinstance(result, list):
            output = {}
            for i, item in enumerate(result):
                if i < len(codes):
                    val = item.get('title') or item.get('CODE') or item.get(codes[i])
                    if not val and isinstance(item, dict):
                        val = list(item.values())[0] if item.values() else ""
                    output[codes[i]] = val
            return output

        # If dict but keys don't match codes, try to match by position
        if isinstance(result, dict):
            # Filter out non-code keys
            valid_result = {}
            for k, v in result.items():
                # Check if key looks like a video code (e.g., ABC-123)
                if re.match(r'^[A-Z]+-\d+', k):
                    valid_result[k] = v

            # If we got valid results, return them
            if valid_result:
                return valid_result

            # Otherwise try to map by position
            values = [v for v in result.values() if isinstance(v, str) and len(v) > 5]
            if len(values) >= len(codes):
                return {codes[i]: values[i] for i in range(len(codes))}

        return result

    except Exception as e:
        print(f"  [ERROR] Gemini: {str(e)[:100]}")
        return {}


def save_translations(conn, videos, translations):
    """Save translations to database"""
    cursor = conn.cursor()
    saved = 0

    for v in videos:
        code = v['code']
        thai_title = translations.get(code)

        if thai_title:
            # Format: CODE ซับไทย กลอน8 CastName
            cast = v['cast_names'][0] if v['cast_names'] else ""
            full_title = f"{code} ซับไทย {thai_title} {cast}".strip()

            try:
                cursor.execute("""
                    INSERT INTO video_translations (id, video_id, lang, title, created_at)
                    VALUES (gen_random_uuid(), %s, 'th', %s, NOW())
                    ON CONFLICT (video_id, lang) DO UPDATE SET title = EXCLUDED.title
                """, (v['id'], full_title))
                saved += 1
            except Exception as e:
                print(f"  [ERROR] DB save {code}: {e}")

    conn.commit()
    return saved


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--limit', type=int, help='Limit videos to process')
    parser.add_argument('--resume', action='store_true', help='Resume from checkpoint')
    args = parser.parse_args()

    print("=" * 60)
    print("  Translate Video Titles to Thai (กลอน 8)")
    print("=" * 60)
    print(f"  Batch size: {BATCH_SIZE}")
    print(f"  Sleep: {SLEEP_BETWEEN_BATCHES}s between batches")
    print()

    # Setup
    model = setup_gemini()
    conn = psycopg2.connect(**DB_CONFIG)

    # Load checkpoint
    checkpoint = load_checkpoint() if args.resume else {"processed_ids": [], "last_batch": 0, "total_done": 0}

    # Get pending videos
    videos = get_pending_videos(conn, checkpoint, args.limit)
    total = len(videos)

    print(f"[INFO] Videos to translate: {total:,}")

    if total == 0:
        print("[OK] All videos already translated!")
        return

    # Process in batches
    processed = checkpoint['total_done']
    errors = 0
    start_time = time.time()

    for i in range(0, total, BATCH_SIZE):
        batch = videos[i:i+BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        total_batches = (total + BATCH_SIZE - 1) // BATCH_SIZE

        # Translate
        translations = translate_batch(model, batch)

        if translations:
            # Save to DB
            saved = save_translations(conn, batch, translations)
            processed += saved

            # Debug if low yield
            if saved < len(batch) // 2:
                print(f"  [DEBUG] Low yield: {saved}/{len(batch)}")
                print(f"  [DEBUG] Codes: {[v['code'] for v in batch[:3]]}")
                print(f"  [DEBUG] Trans keys: {list(translations.keys())[:3]}")

            # Update checkpoint
            checkpoint['processed_ids'].extend([v['id'] for v in batch])
            checkpoint['last_batch'] = batch_num
            checkpoint['total_done'] = processed
            save_checkpoint(checkpoint)

            # Progress
            elapsed = time.time() - start_time
            rate = processed / elapsed if elapsed > 0 else 0
            remaining = (total - (i + len(batch))) / rate if rate > 0 else 0

            print(f"[{batch_num}/{total_batches}] +{saved} | Total: {processed:,} | {rate:.1f}/s | ETA: {remaining/60:.0f}m")
        else:
            errors += 1
            print(f"[{batch_num}/{total_batches}] ERROR - no translations returned")

        # Rate limit
        if i + BATCH_SIZE < total:
            time.sleep(SLEEP_BETWEEN_BATCHES)

    # Final stats
    elapsed = time.time() - start_time
    print()
    print("=" * 60)
    print(f"  DONE!")
    print(f"  Processed: {processed:,}")
    print(f"  Errors: {errors}")
    print(f"  Time: {elapsed/60:.1f} minutes")
    print("=" * 60)

    conn.close()


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Translate Missing Thai Titles
Only translate videos that exist in EN but not in TH

Run: python translate_missing.py
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace', line_buffering=True)

import json
import re
import time
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

EN_FILE = "video_titles_en.json"
TH_FILE = "video_titles_th.json"

BATCH_SIZE = 20
SLEEP_BETWEEN_BATCHES = 4

# Prompt
SYSTEM_PROMPT = """คุณคือผู้เชี่ยวชาญการตั้งชื่อหนังแผ่นสไตล์ "นวลนาง" ยุคเก่า
งานของคุณคือสรุป Metadata เป็นชื่อภาษาไทยแบบ "กลอนสี่ 2 วรรค" (รวม 8 พยางค์พอดี)

**กฎเหล็ก:**
1. จังหวะ: [O O O O] | [O O O O] (รวม 8 พยางค์)
2. สัมผัส: พยางค์ที่ 4 ต้องสัมผัสสระกับพยางค์ที่ 1 หรือ 2 ของวรรคถัดไป
3. คำศัพท์:
   - Vibrator -> ไข่สั่น, Creampie -> แตกใน, Squirt -> น้ำพุ่ง
   - Threesome -> รุมสาม, Gangbang -> รุมโทรม, Blowjob -> อมให้
   - NTR/Cuckold -> เมียมีชู้, แอบแซ่บ
4. ห้ามใส่ชื่อดาราลงในกลอน ให้ตอบเฉพาะตัวชื่อภาษาไทยใน JSON field "CODE"

**ตัวอย่างการตอบ:**
{"MILK-276": "โดนจนน้ำพุ่งสะดุ้งสุดตัว"}
{"ABC-123": "เมียแอบมีชู้รูแทบพังทลาย"}
"""


def extract_code(title):
    if not title:
        return ""
    match = re.match(r'^([A-Z0-9]+-\d+)', title)
    return match.group(1) if match else ""


def setup_gemini():
    genai.configure(api_key=GEMINI_API_KEY)
    safety_settings = [
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
    ]
    return genai.GenerativeModel('gemini-2.0-flash', safety_settings=safety_settings)


def load_cast_map():
    """Load cast names from database"""
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT vc.video_id, c.name as cast_en, ct.name as cast_th
        FROM video_casts vc
        JOIN casts c ON vc.cast_id = c.id
        LEFT JOIN cast_translations ct ON c.id = ct.cast_id AND ct.lang = 'th'
    """)

    cast_map = {}
    for row in cur.fetchall():
        video_id = str(row['video_id'])
        if video_id not in cast_map:
            cast_en = row['cast_en'] or ""
            cast_th = row['cast_th'] or ""
            en_parts = cast_en.split()
            if len(en_parts) == 2:
                cast_en = f"{en_parts[1]} {en_parts[0]}"
            if cast_th:
                cast_map[video_id] = f"{cast_en} ({cast_th})"
            else:
                cast_map[video_id] = cast_en

    conn.close()
    return cast_map


def translate_batch(model, items):
    """Translate a batch"""
    video_data = []
    codes = []

    for item in items:
        code = extract_code(item['title_en'])
        codes.append(code)
        video_data.append({
            "code": code,
            "title": item['title_en'][:200] if item['title_en'] else ""
        })

    codes_str = ", ".join([f'"{c}"' for c in codes if c])

    prompt = f"""{SYSTEM_PROMPT}

**ข้อมูล video**:
{json.dumps(video_data, ensure_ascii=False, indent=2)}

**ตอบเป็น JSON object โดยใช้ code เหล่านี้เป็น key: {codes_str}**"""

    try:
        response = model.generate_content(prompt)

        if not response.candidates:
            print("  [BLOCKED]")
            return {}

        text = response.text.strip()

        # Clean markdown
        if "```" in text:
            match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
            if match:
                text = match.group(1).strip()

        if not text.startswith("{"):
            match = re.search(r'\{[\s\S]*\}', text)
            if match:
                text = match.group(0)

        result = json.loads(text)

        if isinstance(result, dict):
            valid = {}
            for k, v in result.items():
                if re.match(r'^[A-Z0-9]+-\d+', k):
                    valid[k] = v
            return valid

        return {}

    except Exception as e:
        print(f"  [ERROR] {str(e)[:80]}")
        return {}


def log(msg):
    print(msg, flush=True)


def main():
    log("=" * 60)
    log("  Translate Missing Thai Titles")
    log("=" * 60)

    # Load files
    log("\n[1/5] Loading JSON files...")
    with open(EN_FILE, 'r', encoding='utf-8') as f:
        en_data = json.load(f)
    with open(TH_FILE, 'r', encoding='utf-8') as f:
        th_data = json.load(f)

    log(f"  EN: {len(en_data):,}")
    log(f"  TH: {len(th_data):,}")

    # Find missing
    log("\n[2/5] Finding missing translations...")
    th_ids = set(item['video_id'] for item in th_data if item.get('title_th'))
    en_by_id = {item['video_id']: item for item in en_data}

    missing = [item for item in en_data if item['video_id'] not in th_ids]
    log(f"  Missing: {len(missing):,}")

    if not missing:
        log("\n[OK] All translations complete!")
        return

    # Load cast map
    log("\n[3/5] Loading cast data...")
    cast_map = load_cast_map()
    log(f"  Cast entries: {len(cast_map):,}")

    # Setup Gemini
    log("\n[4/5] Setting up Gemini...")
    model = setup_gemini()

    # Convert TH to dict for easy update
    th_dict = {item['video_id']: item for item in th_data}

    # Translate
    log("\n[5/5] Translating missing items...")
    total = len(missing)
    translated = 0
    errors = 0
    start_time = time.time()

    for i in range(0, total, BATCH_SIZE):
        batch = missing[i:i+BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        total_batches = (total + BATCH_SIZE - 1) // BATCH_SIZE

        translations = translate_batch(model, batch)

        # Retry if incomplete
        if len(translations) < len(batch) * 0.5:
            time.sleep(2)
            retry = translate_batch(model, batch)
            translations.update(retry)

        saved = 0
        for item in batch:
            code = extract_code(item['title_en'])
            thai = translations.get(code)

            if thai:
                thai = thai.replace('-', '').replace('|', '').replace('**', '').strip()
                cast = cast_map.get(item['video_id'], "")

                if cast:
                    full_title = f"{code} ซับไทย {thai} {cast}"
                else:
                    full_title = f"{code} ซับไทย {thai}"

                th_dict[item['video_id']] = {
                    "id": item['id'],
                    "video_id": item['video_id'],
                    "title_en": item['title_en'],
                    "title_th": full_title,
                    "cast": cast
                }
                saved += 1

        translated += saved

        # Progress
        elapsed = time.time() - start_time
        rate = (i + len(batch)) / elapsed if elapsed > 0 else 0
        remaining = (total - i - len(batch)) / rate if rate > 0 else 0

        log(f"[{batch_num}/{total_batches}] +{saved} | Total: {translated:,}/{total:,} | ETA: {remaining/60:.1f}m")

        # Save every 5 batches
        if batch_num % 5 == 0:
            th_list = list(th_dict.values())
            with open(TH_FILE, 'w', encoding='utf-8') as f:
                json.dump(th_list, f, ensure_ascii=False, indent=2)

        if i + BATCH_SIZE < total:
            time.sleep(SLEEP_BETWEEN_BATCHES)

    # Final save
    th_list = list(th_dict.values())
    with open(TH_FILE, 'w', encoding='utf-8') as f:
        json.dump(th_list, f, ensure_ascii=False, indent=2)

    # Stats
    elapsed = time.time() - start_time
    log("")
    log("=" * 60)
    log("  DONE!")
    log(f"  Translated: {translated:,}")
    log(f"  Time: {elapsed/60:.1f} minutes")
    log(f"  Output: {TH_FILE}")
    log("")
    log("  To import to database, run:")
    log("    python import_thai_titles.py")
    log("=" * 60)


if __name__ == "__main__":
    main()

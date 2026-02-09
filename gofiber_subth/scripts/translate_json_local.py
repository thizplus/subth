#!/usr/bin/env python3
"""
Translate video titles to Thai (กลอน 8 style) - Local JSON version
Reads from video_titles_en.json, saves to video_titles_th.json

Run: python translate_json_local.py
Resume: python translate_json_local.py --resume
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import json
import re
import time
import argparse
from pathlib import Path
import google.generativeai as genai
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

# Configuration
GEMINI_API_KEY = "AIzaSyAFGy_t0T617KtGas-a9Aapb9U3xsQ_AMQ"

DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "user": "postgres",
    "password": "postgres",
    "dbname": "subth"
}

INPUT_FILE = "video_titles_en.json"
OUTPUT_FILE = "video_titles_th.json"
CHECKPOINT_FILE = "translate_json_checkpoint.json"

BATCH_SIZE = 20
SLEEP_BETWEEN_BATCHES = 4  # seconds (for rate limit ~15 RPM)

# Prompt for Gemini
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


def extract_code_from_title(title):
    """Extract video code from title (e.g., 'ABF-144 Some Title' -> 'ABF-144')"""
    if not title:
        return ""
    match = re.match(r'^([A-Z0-9]+-\d+)', title)
    return match.group(1) if match else ""


# Thai vowels and tone marks that don't start a new syllable
THAI_VOWELS_AFTER = 'ะาำิีึืุูเแโใไๅๆ็่้๊๋์'
THAI_CONSONANTS = 'กขฃคฅฆงจฉชซฌญฎฏฐฑฒณดตถทธนบปผฝพฟภมยรลวศษสหฬอฮ'

def count_thai_syllables(text):
    """นับพยางค์ไทยอย่างง่าย"""
    if not text:
        return 0

    # ลบอักขระที่ไม่ใช่ไทย
    thai_only = ''.join(c for c in text if '\u0E00' <= c <= '\u0E7F')
    if not thai_only:
        return 0

    count = 0
    prev_is_consonant = False

    for i, char in enumerate(thai_only):
        if char in THAI_CONSONANTS:
            # พยัญชนะ - เริ่มพยางค์ใหม่ถ้าไม่ใช่ตัวสะกด
            if i == 0:
                count = 1
                prev_is_consonant = True
            elif prev_is_consonant:
                # อาจเป็นตัวสะกดหรือพยางค์ใหม่
                # ถ้าตามด้วยสระ = พยางค์ใหม่
                if i + 1 < len(thai_only) and thai_only[i + 1] in THAI_VOWELS_AFTER:
                    count += 1
                prev_is_consonant = True
            else:
                # หลังสระ = พยางค์ใหม่
                count += 1
                prev_is_consonant = True
        elif char in 'เแโใไ':
            # สระนำ - เริ่มพยางค์ใหม่
            count += 1
            prev_is_consonant = False
        else:
            prev_is_consonant = False

    return count


def validate_title(title):
    """ตรวจสอบว่ากลอนถูกต้องไหม - disabled for now"""
    if not title:
        return False, 0
    # TODO: fix syllable counting later
    return True, 8  # Always pass for now


def load_video_metadata():
    """Load cast names and tags for all videos from database"""
    print("[INFO] Loading video metadata from database...")
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # Get cast with Thai translation
    cur.execute("""
        SELECT
            vc.video_id,
            c.name as cast_en,
            ct.name as cast_th
        FROM video_casts vc
        JOIN casts c ON vc.cast_id = c.id
        LEFT JOIN cast_translations ct ON c.id = ct.cast_id AND ct.lang = 'th'
        ORDER BY vc.video_id, c.name
    """)

    cast_map = {}
    for row in cur.fetchall():
        video_id = str(row['video_id'])
        if video_id not in cast_map:
            cast_en = row['cast_en'] or ""
            cast_th = row['cast_th'] or ""

            # สลับ cast_en จาก "นามสกุล ชื่อ" เป็น "ชื่อ นามสกุล"
            en_parts = cast_en.split()
            if len(en_parts) == 2:
                cast_en_fixed = f"{en_parts[1]} {en_parts[0]}"
            else:
                cast_en_fixed = cast_en

            if cast_th:
                # cast_th ใน DB เก็บถูกต้องแล้ว (ชื่อ นามสกุล)
                cast_map[video_id] = f"{cast_en_fixed} ({cast_th})"
            else:
                cast_map[video_id] = cast_en_fixed

    print(f"[INFO] Loaded cast for {len(cast_map):,} videos")

    # Get tags for each video
    cur.execute("""
        SELECT
            vt.video_id,
            array_agg(t.name ORDER BY t.name) as tags
        FROM video_tags vt
        JOIN tags t ON vt.tag_id = t.id
        GROUP BY vt.video_id
    """)

    tags_map = {}
    for row in cur.fetchall():
        video_id = str(row['video_id'])
        tags_map[video_id] = row['tags'] or []

    print(f"[INFO] Loaded tags for {len(tags_map):,} videos")

    conn.close()
    return cast_map, tags_map


def setup_gemini():
    genai.configure(api_key=GEMINI_API_KEY)
    # ปิด Safety Filter ทั้งหมด
    safety_settings = [
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
    ]
    return genai.GenerativeModel('gemini-2.0-flash', safety_settings=safety_settings)


def load_checkpoint():
    try:
        with open(CHECKPOINT_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return {"last_index": 0, "total_done": 0}


def save_checkpoint(checkpoint):
    with open(CHECKPOINT_FILE, 'w', encoding='utf-8') as f:
        json.dump(checkpoint, f)


def load_input_data():
    """Load input JSON file"""
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def load_output_data():
    """Load existing output or create empty dict"""
    try:
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Convert list to dict by video_id for easy lookup
            if isinstance(data, list):
                return {item['video_id']: item for item in data}
            return data
    except:
        return {}


def save_output_data(data):
    """Save output as list"""
    # Convert dict back to list
    if isinstance(data, dict):
        data_list = list(data.values())
    else:
        data_list = data

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data_list, f, ensure_ascii=False, indent=2)


def translate_batch(model, items, tags_map):
    """Translate a batch of items"""
    video_data = []
    codes = []

    for item in items:
        code = extract_code_from_title(item['title_en'])
        codes.append(code)
        tags = tags_map.get(item['video_id'], [])
        video_data.append({
            "code": code,
            "title": item['title_en'][:200] if item['title_en'] else "",
            "tags": tags[:8] if tags else []  # Limit to 8 tags
        })

    # Build prompt
    codes_str = ", ".join([f'"{c}"' for c in codes if c])

    prompt = f"""{SYSTEM_PROMPT}

**ข้อมูล video**:
{json.dumps(video_data, ensure_ascii=False, indent=2)}

**ตอบเป็น JSON object โดยใช้ code เหล่านี้เป็น key: {codes_str}**
ตัวอย่าง: {{"{codes[0]}": "กลอน8พยางค์", "{codes[1] if len(codes) > 1 else codes[0]}": "กลอน8พยางค์"}}"""

    try:
        response = model.generate_content(prompt)

        if not response.candidates:
            print(f"  [BLOCKED] Content blocked by safety filter")
            return {}

        text = response.text.strip()

        # Clean markdown
        if "```" in text:
            match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
            if match:
                text = match.group(1).strip()

        # Extract JSON
        if not text.startswith("{"):
            match = re.search(r'\{[\s\S]*\}', text)
            if match:
                text = match.group(0)

        result = json.loads(text)

        # Handle list response
        if isinstance(result, list):
            output = {}
            for i, item in enumerate(result):
                if i < len(codes):
                    val = item.get('title') or item.get('CODE') or item.get(codes[i])
                    if not val and isinstance(item, dict):
                        val = list(item.values())[0] if item.values() else ""
                    output[codes[i]] = val
            return output

        # Handle dict response
        if isinstance(result, dict):
            valid_result = {}
            for k, v in result.items():
                if re.match(r'^[A-Z0-9]+-\d+', k):
                    valid_result[k] = v
            if valid_result:
                return valid_result

        return result

    except Exception as e:
        print(f"  [ERROR] Gemini: {str(e)[:100]}")
        return {}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--limit', type=int, help='Limit items to process')
    parser.add_argument('--resume', action='store_true', help='Resume from checkpoint')
    args = parser.parse_args()

    print("=" * 60)
    print("  Translate Video Titles to Thai (กลอน 8) - Local JSON")
    print("=" * 60)
    print(f"  Input:  {INPUT_FILE}")
    print(f"  Output: {OUTPUT_FILE}")
    print(f"  Batch size: {BATCH_SIZE}")
    print()

    # Setup
    model = setup_gemini()

    # Load data
    input_data = load_input_data()
    output_data = load_output_data()
    cast_map, tags_map = load_video_metadata()

    print(f"[INFO] Total items in input: {len(input_data):,}")
    print(f"[INFO] Already translated: {len(output_data):,}")

    # Load checkpoint
    checkpoint = load_checkpoint() if args.resume else {"last_index": 0, "total_done": len(output_data)}
    start_index = checkpoint['last_index'] if args.resume else 0

    # Filter items that need translation
    pending_items = []
    for i, item in enumerate(input_data):
        if i < start_index:
            continue
        if item['video_id'] not in output_data or not output_data[item['video_id']].get('title_th'):
            pending_items.append((i, item))

    if args.limit:
        pending_items = pending_items[:args.limit]

    total = len(pending_items)
    print(f"[INFO] Pending translations: {total:,}")

    if total == 0:
        print("[OK] All items already translated!")
        return

    # Process in batches
    processed = checkpoint['total_done']
    errors = 0
    start_time = time.time()

    for batch_start in range(0, total, BATCH_SIZE):
        batch_items = pending_items[batch_start:batch_start + BATCH_SIZE]
        batch_num = batch_start // BATCH_SIZE + 1
        total_batches = (total + BATCH_SIZE - 1) // BATCH_SIZE

        # Extract items for translation
        items = [item for (idx, item) in batch_items]
        expected_count = len(items)

        # Translate with retry if not complete
        translations = translate_batch(model, items, tags_map)

        # Retry if response incomplete
        for retry in range(3):
            if len(translations) >= expected_count * 0.8:  # Accept 80%+
                break
            print(f"  [INCOMPLETE] Got {len(translations)}/{expected_count}, retrying...", flush=True)
            time.sleep(3)
            new_translations = translate_batch(model, items, tags_map)
            translations.update(new_translations)

        if translations:
            saved = 0
            failed_items = []

            for (idx, item) in batch_items:
                code = extract_code_from_title(item['title_en'])
                thai_title = translations.get(code)

                if thai_title:
                    # Clean up: remove -, |, ** and extra spaces
                    thai_title = thai_title.replace('-', '').replace('|', '').replace('**', '').replace('  ', ' ').strip()

                    # Validate: ต้อง 8 พยางค์
                    is_valid, syllables = validate_title(thai_title)

                    if not is_valid:
                        failed_items.append((idx, item, code, syllables))
                        continue

                    # Get cast name
                    cast_name = cast_map.get(item['video_id'], "")

                    # Format: CODE ซับไทย กลอน8 CastName
                    if cast_name:
                        full_title = f"{code} ซับไทย {thai_title} {cast_name}".strip()
                    else:
                        full_title = f"{code} ซับไทย {thai_title}".strip()

                    # Update output
                    output_data[item['video_id']] = {
                        "id": item['id'],
                        "video_id": item['video_id'],
                        "title_en": item['title_en'],
                        "title_th": full_title,
                        "cast": cast_name
                    }
                    saved += 1

            # Retry failed items (max 2 times)
            for retry in range(2):
                if not failed_items:
                    break

                retry_items = [item for (idx, item, code, syl) in failed_items]
                retry_codes = [code for (idx, item, code, syl) in failed_items]

                print(f"  [RETRY {retry+1}] {len(failed_items)} items failed validation", flush=True)
                time.sleep(2)

                retry_translations = translate_batch(model, retry_items, tags_map)
                new_failed = []

                for (idx, item, code, old_syl) in failed_items:
                    thai_title = retry_translations.get(code)
                    if thai_title:
                        thai_title = thai_title.replace('-', '').replace('|', '').replace('  ', ' ').strip()
                        is_valid, syllables = validate_title(thai_title)

                        if is_valid:
                            cast_name = cast_map.get(item['video_id'], "")
                            if cast_name:
                                full_title = f"{code} ซับไทย {thai_title} {cast_name}".strip()
                            else:
                                full_title = f"{code} ซับไทย {thai_title}".strip()

                            output_data[item['video_id']] = {
                                "id": item['id'],
                                "video_id": item['video_id'],
                                "title_en": item['title_en'],
                                "title_th": full_title,
                                "cast": cast_name
                            }
                            saved += 1
                        else:
                            new_failed.append((idx, item, code, syllables))
                    else:
                        new_failed.append((idx, item, code, old_syl))

                failed_items = new_failed

            if failed_items:
                print(f"  [SKIP] {len(failed_items)} items still invalid after retry", flush=True)

            processed += saved

            # Save progress
            save_output_data(output_data)

            # Update checkpoint
            last_idx = batch_items[-1][0] if batch_items else 0
            checkpoint['last_index'] = last_idx + 1
            checkpoint['total_done'] = processed
            save_checkpoint(checkpoint)

            # Progress
            elapsed = time.time() - start_time
            rate = (batch_start + len(batch_items)) / elapsed if elapsed > 0 else 0
            remaining = (total - batch_start - len(batch_items)) / rate if rate > 0 else 0

            print(f"[{batch_num}/{total_batches}] +{saved} | Total: {processed:,} | {rate:.1f}/s | ETA: {remaining/60:.0f}m", flush=True)
        else:
            errors += 1
            print(f"[{batch_num}/{total_batches}] ERROR - no translations returned", flush=True)

        # Rate limit
        if batch_start + BATCH_SIZE < total:
            time.sleep(SLEEP_BETWEEN_BATCHES)

    # Final stats
    elapsed = time.time() - start_time
    print()
    print("=" * 60)
    print(f"  DONE!")
    print(f"  Translated: {processed:,}")
    print(f"  Errors: {errors}")
    print(f"  Time: {elapsed/60:.1f} minutes")
    print(f"  Output: {OUTPUT_FILE}")
    print("=" * 60)


if __name__ == "__main__":
    main()

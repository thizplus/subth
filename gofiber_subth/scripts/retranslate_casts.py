#!/usr/bin/env python3
"""
Re-translate casts with Thai name order (given name first)
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import json
import time
import psycopg2
from psycopg2.extras import RealDictCursor
from tqdm import tqdm
import google.generativeai as genai

GEMINI_API_KEY = 'AIzaSyAFGy_t0T617KtGas-a9Aapb9U3xsQ_AMQ'
DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "user": "postgres",
    "password": "postgres",
    "dbname": "subth"
}
BATCH_SIZE = 50


def main():
    print("=" * 60)
    print("  Re-translate Casts (Thai name order)")
    print("=" * 60)

    # Setup Gemini
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.0-flash')
    print("[OK] Gemini ready")

    # Get all casts from DB
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT name FROM casts ORDER BY name')
    casts = [r['name'] for r in cursor.fetchall()]
    print(f"Total casts: {len(casts)}")

    # Translate with new prompt
    translations = {}

    for i in tqdm(range(0, len(casts), BATCH_SIZE), desc='Translating'):
        batch = casts[i:i + BATCH_SIZE]

        prompt = """แปลงชื่อดาราญี่ปุ่นเหล่านี้เป็นภาษาไทย โดย:
1. เรียง "ชื่อ นามสกุล" แบบไทย (ชื่อจริงก่อน นามสกุลตาม)
2. ถอดเสียงเป็นไทยให้ตรงการออกเสียงญี่ปุ่น

ชื่อ:
""" + json.dumps(batch, ensure_ascii=False) + """

ตัวอย่าง:
{"Yua Mikami": "ยัว มิคามิ", "Tachibana Mary": "แมรี่ ทาจิบานะ", "Abe Mikako": "มิคาโกะ อาเบะ", "Honda Misaki": "มิซากิ ฮอนดะ", "Aoi Tsukasa": "สึคาสะ อาโออิ"}

ตอบเป็น JSON object เท่านั้น"""

        try:
            response = model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith('```'):
                lines = text.split('\n')
                text = '\n'.join(lines[1:-1])
            result = json.loads(text)
            translations.update(result)
        except Exception as e:
            print(f'\nError: {e}')

        time.sleep(1)

    # Load existing translations
    with open('translations_th.json', 'r', encoding='utf-8') as f:
        existing = json.load(f)

    # Update casts only
    existing['casts'] = translations

    # Save
    with open('translations_th.json', 'w', encoding='utf-8') as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)

    print(f'\nTranslated {len(translations)} casts')
    print('Saved to translations_th.json')

    # Update database
    print('\nUpdating database...')
    cursor.execute("SELECT id, name FROM casts")
    cast_map = {r['name']: r['id'] for r in cursor.fetchall()}

    updated = 0
    for name, thai in tqdm(translations.items(), desc='Updating DB'):
        if name in cast_map:
            cursor.execute("""
                UPDATE cast_translations SET name = %s
                WHERE cast_id = %s AND lang = 'th'
            """, (thai, cast_map[name]))
            updated += 1

    conn.commit()
    print(f'Updated {updated} casts in database')

    # Show samples
    print('\nSample translations:')
    samples = list(translations.items())[:10]
    for en, th in samples:
        print(f'  {en} -> {th}')

    conn.close()
    print('\n[OK] Done!')


if __name__ == "__main__":
    main()

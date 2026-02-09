#!/usr/bin/env python3
"""
Re-translate tags with colloquial Thai
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
    print("  Re-translate Tags (Colloquial Thai)")
    print("=" * 60)

    # Setup Gemini
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.0-flash')
    print("[OK] Gemini ready")

    # Get all tags from DB
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute('SELECT name FROM tags ORDER BY name')
    tags = [r['name'] for r in cursor.fetchall()]
    print(f"Total tags: {len(tags)}")

    # Translate with new prompt
    translations = {}

    for i in tqdm(range(0, len(tags), BATCH_SIZE), desc='Translating'):
        batch = tags[i:i + BATCH_SIZE]

        prompt = """แปล tags วิดีโอผู้ใหญ่เหล่านี้เป็นภาษาไทย ให้ดูน่าสนใจ น่าคลิก
- ใช้คำสั้นๆ กระชับ 1-3 คำ
- ไม่หยาบคายเกินไป แต่ดูเซ็กซี่
- ใช้คำที่คนไทยคุ้นเคย

Tags:
""" + json.dumps(batch, ensure_ascii=False) + """

ตัวอย่าง:
{"Big Tits": "นมใหญ่", "Beautiful Girl": "สาวสวย", "Creampie": "แตกใน", "Blowjob": "โม๊ค", "Mature": "สาวใหญ่", "Amateur": "มือใหม่", "Anal": "ทางหลัง", "Threesome": "3P", "Cosplay": "คอสเพลย์", "Office Lady": "สาวออฟฟิศ"}

ตอบเป็น JSON object เท่านั้น ไม่ต้องอธิบาย แปลแค่คำเดียวต่อ tag"""

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

    # Load existing translations (keep casts)
    with open('translations_th.json', 'r', encoding='utf-8') as f:
        existing = json.load(f)

    # Update tags only
    existing['tags'] = translations

    # Save
    with open('translations_th.json', 'w', encoding='utf-8') as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)

    print(f'\nTranslated {len(translations)} tags')
    print('Saved to translations_th.json')

    # Update database
    print('\nUpdating database...')
    cursor.execute("SELECT id, name FROM tags")
    tag_map = {r['name']: r['id'] for r in cursor.fetchall()}

    updated = 0
    for name, thai in tqdm(translations.items(), desc='Updating DB'):
        if name in tag_map:
            cursor.execute("""
                UPDATE tag_translations SET name = %s
                WHERE tag_id = %s AND lang = 'th'
            """, (thai, tag_map[name]))
            updated += 1

    conn.commit()
    print(f'Updated {updated} tags in database')

    conn.close()
    print('\n[OK] Done!')


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Apply manual translations to missing items
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import json
import re
import psycopg2
from psycopg2.extras import RealDictCursor
from manual_translations import TRANSLATIONS

EN_FILE = "video_titles_en.json"
TH_FILE = "video_titles_th.json"

DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "user": "postgres",
    "password": "postgres",
    "dbname": "subth"
}


def extract_code(title):
    if not title:
        return ""
    # Match patterns like: CPZ69-H009, ABF-282, IBW-864z, ADV-SR0166
    match = re.match(r'^([A-Za-z0-9\*\[\]]+[-][A-Za-z0-9]+)', title)
    return match.group(1) if match else title.split()[0] if title else ""


def load_cast_map():
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


def main():
    print("=" * 60)
    print("  Apply Manual Translations")
    print("=" * 60)

    # Load files
    print("\n[1/4] Loading JSON files...")
    with open(EN_FILE, 'r', encoding='utf-8') as f:
        en_data = json.load(f)
    with open(TH_FILE, 'r', encoding='utf-8') as f:
        th_data = json.load(f)

    print(f"  EN: {len(en_data):,}")
    print(f"  TH: {len(th_data):,}")
    print(f"  Manual translations: {len(TRANSLATIONS)}")

    # Find missing
    print("\n[2/4] Finding missing items...")
    th_ids = set(item['video_id'] for item in th_data if item.get('title_th'))
    missing = [item for item in en_data if item['video_id'] not in th_ids]
    print(f"  Missing: {len(missing)}")

    # Load cast
    print("\n[3/4] Loading cast data...")
    cast_map = load_cast_map()

    # Convert TH to dict
    th_dict = {item['video_id']: item for item in th_data}

    # Apply translations
    print("\n[4/4] Applying manual translations...")
    applied = 0
    not_found = []

    for item in missing:
        title_en = item.get('title_en', '')
        code = extract_code(title_en)

        # Try to find translation
        thai = None
        for trans_code, trans_thai in TRANSLATIONS.items():
            if code.startswith(trans_code) or trans_code in code:
                thai = trans_thai
                break

        if thai:
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
            applied += 1
            print(f"  + {code}: {thai}")
        else:
            not_found.append(code)

    # Save
    th_list = list(th_dict.values())
    with open(TH_FILE, 'w', encoding='utf-8') as f:
        json.dump(th_list, f, ensure_ascii=False, indent=2)

    print()
    print("=" * 60)
    print("  DONE!")
    print(f"  Applied: {applied}")
    print(f"  Not found: {len(not_found)}")
    if not_found:
        print(f"  Missing codes: {not_found[:10]}")
    print("=" * 60)


if __name__ == "__main__":
    main()

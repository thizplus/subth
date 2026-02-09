#!/usr/bin/env python3
"""
Import Thai Titles from JSON to Database
Reads video_titles_th.json and inserts into video_translations table

Run: python import_thai_titles.py
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import json
import psycopg2
from psycopg2.extras import RealDictCursor
from tqdm import tqdm

# Configuration
DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "user": "postgres",
    "password": "postgres",
    "dbname": "subth"
}

INPUT_FILE = "video_titles_th.json"


def main():
    print("=" * 60)
    print("  Import Thai Titles to Database")
    print("=" * 60)

    # Load JSON
    print(f"\n[1/4] Loading {INPUT_FILE}...")
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"  Total entries in JSON: {len(data):,}")

    # Filter entries with title_th
    valid_entries = [item for item in data if item.get('title_th') and item.get('video_id')]
    print(f"  Valid entries (with title_th): {len(valid_entries):,}")

    if not valid_entries:
        print("\n[ERROR] No valid entries to import!")
        return

    # Connect to database
    print("\n[2/4] Connecting to database...")
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    print("  Connected!")

    # Check existing Thai translations
    print("\n[3/4] Checking existing translations...")
    cursor.execute("""
        SELECT video_id FROM video_translations WHERE lang = 'th'
    """)
    existing_ids = set(str(row['video_id']) for row in cursor.fetchall())
    print(f"  Existing Thai translations: {len(existing_ids):,}")

    # Filter new entries
    new_entries = [item for item in valid_entries if item['video_id'] not in existing_ids]
    update_entries = [item for item in valid_entries if item['video_id'] in existing_ids]

    print(f"  New to insert: {len(new_entries):,}")
    print(f"  Already exists: {len(update_entries):,}")

    # Import new entries
    print("\n[4/4] Importing Thai titles...")
    inserted = 0
    errors = 0

    for item in tqdm(new_entries, desc="Inserting"):
        try:
            cursor.execute("""
                INSERT INTO video_translations (id, video_id, lang, title, created_at, updated_at)
                VALUES (gen_random_uuid(), %s, 'th', %s, NOW(), NOW())
                ON CONFLICT (video_id, lang) DO UPDATE SET title = EXCLUDED.title, updated_at = NOW()
            """, (item['video_id'], item['title_th']))
            inserted += 1

            # Commit every 1000 records
            if inserted % 1000 == 0:
                conn.commit()

        except Exception as e:
            errors += 1
            if errors <= 5:
                print(f"\n  Error: {e}")

    conn.commit()

    # Final stats
    print("\n" + "=" * 60)
    print("  DONE!")
    print("=" * 60)
    print(f"  Inserted: {inserted:,}")
    print(f"  Errors:   {errors:,}")

    # Verify
    cursor.execute("SELECT COUNT(*) as count FROM video_translations WHERE lang = 'th'")
    final_count = cursor.fetchone()['count']
    print(f"\n  Total Thai translations in DB: {final_count:,}")

    cursor.close()
    conn.close()


if __name__ == "__main__":
    main()

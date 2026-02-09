#!/usr/bin/env python3
"""
Step 2: Import translations from JSON to database
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

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

INPUT_FILE = "translations_th.json"


def main():
    print("=" * 60)
    print("  Import Translations to Database (Step 2)")
    print("=" * 60)

    # Load translations
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        translations = json.load(f)

    print(f"Loaded translations:")
    print(f"  Categories: {len(translations['categories'])}")
    print(f"  Tags: {len(translations['tags'])}")
    print(f"  Casts: {len(translations['casts'])}")

    # Connect to database
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    print("\n[OK] Database connected")

    # === CATEGORIES ===
    print("\n--- Importing Categories ---")
    cursor.execute("SELECT id, name FROM categories")
    categories = {r['name']: r['id'] for r in cursor.fetchall()}

    added = 0
    for name, thai in translations['categories'].items():
        if name in categories:
            cursor.execute("""
                INSERT INTO category_translations (id, category_id, lang, name, created_at)
                VALUES (gen_random_uuid(), %s, 'th', %s, NOW())
                ON CONFLICT (category_id, lang) DO UPDATE SET name = EXCLUDED.name
            """, (categories[name], thai))
            added += 1
    conn.commit()
    print(f"  Imported: {added}")

    # === TAGS ===
    print("\n--- Importing Tags ---")
    cursor.execute("SELECT id, name FROM tags")
    tags = {r['name']: r['id'] for r in cursor.fetchall()}

    added = 0
    for name, thai in tqdm(translations['tags'].items(), desc="Tags"):
        if name in tags:
            cursor.execute("""
                INSERT INTO tag_translations (id, tag_id, lang, name, created_at)
                VALUES (gen_random_uuid(), %s, 'th', %s, NOW())
                ON CONFLICT (tag_id, lang) DO UPDATE SET name = EXCLUDED.name
            """, (tags[name], thai))
            added += 1
    conn.commit()
    print(f"  Imported: {added}")

    # === CASTS ===
    print("\n--- Importing Casts ---")
    cursor.execute("SELECT id, name FROM casts")
    casts = {r['name']: r['id'] for r in cursor.fetchall()}

    added = 0
    for name, thai in tqdm(translations['casts'].items(), desc="Casts"):
        if name in casts:
            cursor.execute("""
                INSERT INTO cast_translations (id, cast_id, lang, name, created_at)
                VALUES (gen_random_uuid(), %s, 'th', %s, NOW())
                ON CONFLICT (cast_id, lang) DO UPDATE SET name = EXCLUDED.name
            """, (casts[name], thai))
            added += 1
    conn.commit()
    print(f"  Imported: {added}")

    # Final stats
    print("\n" + "=" * 60)
    print("  Final Database Stats")
    print("=" * 60)

    for table in ['category_translations', 'tag_translations', 'cast_translations']:
        cursor.execute(f"SELECT COUNT(*) as count FROM {table} WHERE lang = 'th'")
        count = cursor.fetchone()['count']
        print(f"  {table}: {count:,}")

    conn.close()
    print("\n[OK] Import complete!")


if __name__ == "__main__":
    main()

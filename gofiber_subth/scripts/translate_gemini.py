#!/usr/bin/env python3
"""
Translate entities to Thai using Gemini API
Translates: Categories, Tags, Casts
"""

import sys
import io

# Fix console encoding for Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import json
import time
import psycopg2
from psycopg2.extras import RealDictCursor
from tqdm import tqdm
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

# Batch size for translation
BATCH_SIZE = 50  # Translate 50 items at a time


def setup_gemini():
    """Setup Gemini API"""
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.0-flash')
    return model


def translate_batch(model, items: list, item_type: str) -> dict:
    """Translate a batch of items using Gemini"""
    if not items:
        return {}

    # Create prompt based on type
    if item_type == "tags":
        prompt = f"""Translate these English video tags/genres to Thai.
Return ONLY a JSON object with the English term as key and Thai translation as value.
Keep it concise and natural in Thai.

Tags to translate:
{json.dumps(items, ensure_ascii=False)}

Example output format:
{{"Big Tits": "นมใหญ่", "Mature": "สาวใหญ่"}}

Return ONLY the JSON object, no explanation."""

    elif item_type == "categories":
        prompt = f"""Translate these English video category names to Thai.
Return ONLY a JSON object with the English term as key and Thai translation as value.

Categories to translate:
{json.dumps(items, ensure_ascii=False)}

Return ONLY the JSON object, no explanation."""

    elif item_type == "casts":
        prompt = f"""Convert these Japanese actress/actor names to Thai script (transliteration).
Return ONLY a JSON object with the original name as key and Thai transliteration as value.
For Japanese names, transliterate the pronunciation to Thai characters.

Names to convert:
{json.dumps(items, ensure_ascii=False)}

Example: {{"Yua Mikami": "ยัว มิคามิ", "Eimi Fukada": "เอมิ ฟุคาดะ"}}

Return ONLY the JSON object, no explanation."""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()

        # Clean up response - extract JSON
        if text.startswith("```"):
            # Remove markdown code blocks
            lines = text.split("\n")
            text = "\n".join(lines[1:-1])

        # Parse JSON
        result = json.loads(text)
        return result
    except json.JSONDecodeError as e:
        print(f"\nJSON parse error: {e}")
        print(f"Response was: {text[:200]}...")
        return {}
    except Exception as e:
        print(f"\nGemini API error: {e}")
        return {}


def translate_categories(model, conn):
    """Translate categories to Thai"""
    print("\n" + "=" * 60)
    print("  Translating Categories")
    print("=" * 60)

    cursor = conn.cursor(cursor_factory=RealDictCursor)

    # Get categories without Thai translation
    cursor.execute("""
        SELECT c.id, c.name FROM categories c
        LEFT JOIN category_translations ct ON c.id = ct.category_id AND ct.lang = 'th'
        WHERE ct.id IS NULL
    """)
    categories = cursor.fetchall()

    if not categories:
        print("All categories already translated!")
        return

    print(f"Categories to translate: {len(categories)}")

    # Translate
    names = [c['name'] for c in categories]
    translations = translate_batch(model, names, "categories")

    # Insert translations
    added = 0
    for cat in categories:
        thai_name = translations.get(cat['name'])
        if thai_name:
            cursor.execute("""
                INSERT INTO category_translations (id, category_id, lang, name, created_at)
                VALUES (gen_random_uuid(), %s, 'th', %s, NOW())
                ON CONFLICT (category_id, lang) DO UPDATE SET name = EXCLUDED.name
            """, (cat['id'], thai_name))
            added += 1

    conn.commit()
    print(f"Added {added} category translations")

    # Show results
    print("\nCategory translations:")
    for cat in categories:
        thai = translations.get(cat['name'], '?')
        print(f"  {cat['name']} -> {thai}")


def translate_tags(model, conn):
    """Translate tags to Thai"""
    print("\n" + "=" * 60)
    print("  Translating Tags")
    print("=" * 60)

    cursor = conn.cursor(cursor_factory=RealDictCursor)

    # Get tags without Thai translation
    cursor.execute("""
        SELECT t.id, t.name FROM tags t
        LEFT JOIN tag_translations tt ON t.id = tt.tag_id AND tt.lang = 'th'
        WHERE tt.id IS NULL
        ORDER BY t.name
    """)
    tags = cursor.fetchall()

    if not tags:
        print("All tags already translated!")
        return

    print(f"Tags to translate: {len(tags)}")

    # Process in batches
    added = 0
    for i in tqdm(range(0, len(tags), BATCH_SIZE), desc="Translating tags"):
        batch = tags[i:i + BATCH_SIZE]
        names = [t['name'] for t in batch]

        translations = translate_batch(model, names, "tags")

        # Insert translations
        for tag in batch:
            thai_name = translations.get(tag['name'])
            if thai_name:
                cursor.execute("""
                    INSERT INTO tag_translations (id, tag_id, lang, name, created_at)
                    VALUES (gen_random_uuid(), %s, 'th', %s, NOW())
                    ON CONFLICT (tag_id, lang) DO UPDATE SET name = EXCLUDED.name
                """, (tag['id'], thai_name))
                added += 1

        conn.commit()
        time.sleep(1)  # Rate limiting

    print(f"\nAdded {added} tag translations")


def translate_casts(model, conn):
    """Translate casts to Thai"""
    print("\n" + "=" * 60)
    print("  Translating Casts (Japanese names to Thai)")
    print("=" * 60)

    cursor = conn.cursor(cursor_factory=RealDictCursor)

    # Get casts without Thai translation
    cursor.execute("""
        SELECT c.id, c.name FROM casts c
        LEFT JOIN cast_translations ct ON c.id = ct.cast_id AND ct.lang = 'th'
        WHERE ct.id IS NULL
        ORDER BY c.name
    """)
    casts = cursor.fetchall()

    if not casts:
        print("All casts already translated!")
        return

    print(f"Casts to translate: {len(casts)}")

    # Process in batches
    added = 0
    errors = 0

    for i in tqdm(range(0, len(casts), BATCH_SIZE), desc="Translating casts"):
        batch = casts[i:i + BATCH_SIZE]
        names = [c['name'] for c in batch]

        translations = translate_batch(model, names, "casts")

        # Insert translations
        for cast in batch:
            thai_name = translations.get(cast['name'])
            if thai_name:
                try:
                    cursor.execute("""
                        INSERT INTO cast_translations (id, cast_id, lang, name, created_at)
                        VALUES (gen_random_uuid(), %s, 'th', %s, NOW())
                        ON CONFLICT (cast_id, lang) DO UPDATE SET name = EXCLUDED.name
                    """, (cast['id'], thai_name))
                    added += 1
                except Exception as e:
                    errors += 1
            else:
                errors += 1

        conn.commit()
        time.sleep(1)  # Rate limiting

    print(f"\nAdded {added} cast translations")
    print(f"Errors: {errors}")


def main():
    print("=" * 60)
    print("  Gemini Translation Script")
    print("  Translating: Categories, Tags, Casts -> Thai")
    print("=" * 60)

    # Setup Gemini
    print("\nSetting up Gemini API...")
    model = setup_gemini()
    print("[OK] Gemini ready")

    # Connect to database
    conn = psycopg2.connect(**DB_CONFIG)
    print("[OK] Database connected")

    # Translate each entity type
    translate_categories(model, conn)
    translate_tags(model, conn)
    translate_casts(model, conn)

    # Final stats
    cursor = conn.cursor()
    print("\n" + "=" * 60)
    print("  Final Translation Stats")
    print("=" * 60)

    for table in ['category_translations', 'tag_translations', 'cast_translations']:
        cursor.execute(f"SELECT COUNT(*) FROM {table} WHERE lang = 'th'")
        count = cursor.fetchone()[0]
        print(f"  {table}: {count:,}")

    conn.close()
    print("\n[OK] Translation complete!")


if __name__ == "__main__":
    main()

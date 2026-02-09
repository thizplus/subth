#!/usr/bin/env python3
"""
Step 1: Translate entities to Thai using Gemini API and save to JSON
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import json
import time
import os
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

OUTPUT_FILE = "translations_th.json"
BATCH_SIZE = 50


def setup_gemini():
    """Setup Gemini API"""
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.0-flash')
    return model


def load_progress():
    """Load existing translations if any"""
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {
        "categories": {},
        "tags": {},
        "casts": {}
    }


def save_progress(data):
    """Save translations to JSON"""
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def translate_batch(model, items: list, item_type: str) -> dict:
    """Translate a batch of items using Gemini"""
    if not items:
        return {}

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
            lines = text.split("\n")
            text = "\n".join(lines[1:-1])

        result = json.loads(text)
        return result
    except json.JSONDecodeError as e:
        print(f"\nJSON parse error: {e}")
        print(f"Response: {text[:200]}...")
        return {}
    except Exception as e:
        print(f"\nGemini API error: {e}")
        return {}


def main():
    print("=" * 60)
    print("  Translate to JSON (Step 1)")
    print("=" * 60)

    # Setup Gemini
    print("\nSetting up Gemini API...")
    model = setup_gemini()
    print("[OK] Gemini ready")

    # Load existing progress
    translations = load_progress()
    print(f"[OK] Loaded existing: {len(translations['categories'])} categories, {len(translations['tags'])} tags, {len(translations['casts'])} casts")

    # Connect to database to get items
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    print("[OK] Database connected")

    # === CATEGORIES ===
    print("\n" + "=" * 60)
    print("  Translating Categories")
    print("=" * 60)

    cursor.execute("SELECT name FROM categories ORDER BY name")
    categories = [r['name'] for r in cursor.fetchall()]
    to_translate = [c for c in categories if c not in translations['categories']]

    print(f"Total: {len(categories)}, Already done: {len(translations['categories'])}, Remaining: {len(to_translate)}")

    if to_translate:
        result = translate_batch(model, to_translate, "categories")
        translations['categories'].update(result)
        save_progress(translations)
        print(f"Translated {len(result)} categories")
        for en, th in result.items():
            print(f"  {en} -> {th}")

    # === TAGS ===
    print("\n" + "=" * 60)
    print("  Translating Tags")
    print("=" * 60)

    cursor.execute("SELECT name FROM tags ORDER BY name")
    tags = [r['name'] for r in cursor.fetchall()]
    to_translate = [t for t in tags if t not in translations['tags']]

    print(f"Total: {len(tags)}, Already done: {len(translations['tags'])}, Remaining: {len(to_translate)}")

    if to_translate:
        for i in tqdm(range(0, len(to_translate), BATCH_SIZE), desc="Tags"):
            batch = to_translate[i:i + BATCH_SIZE]
            result = translate_batch(model, batch, "tags")
            translations['tags'].update(result)
            save_progress(translations)
            time.sleep(1)
        print(f"Translated {len(translations['tags'])} tags total")

    # === CASTS ===
    print("\n" + "=" * 60)
    print("  Translating Casts")
    print("=" * 60)

    cursor.execute("SELECT name FROM casts ORDER BY name")
    casts = [r['name'] for r in cursor.fetchall()]
    to_translate = [c for c in casts if c not in translations['casts']]

    print(f"Total: {len(casts)}, Already done: {len(translations['casts'])}, Remaining: {len(to_translate)}")

    if to_translate:
        for i in tqdm(range(0, len(to_translate), BATCH_SIZE), desc="Casts"):
            batch = to_translate[i:i + BATCH_SIZE]
            result = translate_batch(model, batch, "casts")
            translations['casts'].update(result)
            save_progress(translations)
            time.sleep(1)
        print(f"Translated {len(translations['casts'])} casts total")

    conn.close()

    # Summary
    print("\n" + "=" * 60)
    print("  Summary")
    print("=" * 60)
    print(f"  Categories: {len(translations['categories'])}")
    print(f"  Tags: {len(translations['tags'])}")
    print(f"  Casts: {len(translations['casts'])}")
    print(f"\nSaved to: {OUTPUT_FILE}")
    print("\nNext step: Run import_translations.py to insert into database")


if __name__ == "__main__":
    main()

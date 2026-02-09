#!/usr/bin/env python3
"""
Fix EN titles and reset TH titles for re-translation

This script:
1. Reads correct titles from JSON files
2. Updates EN titles in video_translations to match JSON
3. Deletes TH titles that were translated from wrong EN source
4. Reports how many TH titles need re-translation

Usage:
    python fix_titles.py --check      # Check only, no changes
    python fix_titles.py --fix-en     # Fix EN titles only
    python fix_titles.py --fix-all    # Fix EN and delete wrong TH
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import json
import argparse
from pathlib import Path
from datetime import datetime
import psycopg2
from psycopg2.extras import execute_batch
from tqdm import tqdm

# Configuration
DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "user": "postgres",
    "password": "postgres",
    "dbname": "subth"
}

DATA_DIR = Path(r"D:\Admin\Desktop\MY PROJECT\_suekk_bot\output")
BATCH_SIZE = 1000


def load_json_titles():
    """Load correct titles from JSON files"""
    print("Loading titles from JSON files...")

    titles = {}
    json_files = sorted(DATA_DIR.glob("listings_*.json"))

    for jf in tqdm(json_files, desc="Loading JSON"):
        with open(jf, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for item in data.get('items', []):
                code = item.get('code')
                title = item.get('title', '')
                if code and title:
                    # Keep the first occurrence (or latest based on your needs)
                    if code not in titles:
                        titles[code] = title

    print(f"Loaded {len(titles):,} titles from JSON")
    return titles


def check_status(conn, json_titles):
    """Check current status of EN and TH titles"""
    cursor = conn.cursor()

    print("\n" + "=" * 60)
    print("  Current Status")
    print("=" * 60)

    # Total counts
    cursor.execute("SELECT COUNT(*) FROM videos WHERE code IS NOT NULL")
    total_videos = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM video_translations WHERE lang = 'en'")
    total_en = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM video_translations WHERE lang = 'th'")
    total_th = cursor.fetchone()[0]

    print(f"\nTotal videos with code: {total_videos:,}")
    print(f"EN translations: {total_en:,}")
    print(f"TH translations: {total_th:,}")

    # Check EN mismatches
    cursor.execute("""
        SELECT v.code, vt.title
        FROM videos v
        JOIN video_translations vt ON v.id = vt.video_id AND vt.lang = 'en'
        WHERE v.code IS NOT NULL
    """)

    en_correct = 0
    en_wrong = 0
    wrong_codes = []

    for code, db_title in cursor.fetchall():
        json_title = json_titles.get(code, '')
        if json_title and db_title == json_title:
            en_correct += 1
        elif json_title:
            en_wrong += 1
            if len(wrong_codes) < 5:
                wrong_codes.append((code, db_title[:40], json_title[:40]))

    print(f"\nEN titles correct: {en_correct:,} ({en_correct/(en_correct+en_wrong)*100:.1f}%)")
    print(f"EN titles wrong: {en_wrong:,} ({en_wrong/(en_correct+en_wrong)*100:.1f}%)")

    if wrong_codes:
        print("\nSample wrong EN titles:")
        for code, db_t, json_t in wrong_codes:
            print(f"  {code}:")
            print(f"    DB:   {db_t}...")
            print(f"    JSON: {json_t}...")

    # TH titles that need re-translation (linked to wrong EN)
    print(f"\nTH titles to re-translate: {total_th:,} (all, since EN was wrong)")

    return {
        'total_videos': total_videos,
        'total_en': total_en,
        'total_th': total_th,
        'en_correct': en_correct,
        'en_wrong': en_wrong
    }


def fix_en_titles(conn, json_titles):
    """Fix EN titles from JSON"""
    cursor = conn.cursor()

    print("\n" + "=" * 60)
    print("  Fixing EN Titles")
    print("=" * 60)

    # Get all videos with their current EN titles
    cursor.execute("""
        SELECT v.id, v.code, vt.id as trans_id, vt.title
        FROM videos v
        JOIN video_translations vt ON v.id = vt.video_id AND vt.lang = 'en'
        WHERE v.code IS NOT NULL
    """)

    updates = []
    for video_id, code, trans_id, current_title in cursor.fetchall():
        correct_title = json_titles.get(code)
        if correct_title and correct_title != current_title:
            updates.append((correct_title, trans_id))

    print(f"EN titles to update: {len(updates):,}")

    if updates:
        # Update in batches
        for i in tqdm(range(0, len(updates), BATCH_SIZE), desc="Updating EN"):
            batch = updates[i:i+BATCH_SIZE]
            execute_batch(cursor, """
                UPDATE video_translations
                SET title = %s, updated_at = NOW()
                WHERE id = %s
            """, batch)
            conn.commit()

        print(f"Updated {len(updates):,} EN titles")

    return len(updates)


def delete_wrong_th_titles(conn):
    """Delete TH titles that were translated from wrong EN"""
    cursor = conn.cursor()

    print("\n" + "=" * 60)
    print("  Deleting TH Titles (for re-translation)")
    print("=" * 60)

    # Count TH titles
    cursor.execute("SELECT COUNT(*) FROM video_translations WHERE lang = 'th'")
    th_count = cursor.fetchone()[0]

    print(f"TH titles to delete: {th_count:,}")

    # Delete all TH titles
    cursor.execute("DELETE FROM video_translations WHERE lang = 'th'")
    conn.commit()

    print(f"Deleted {th_count:,} TH titles")
    print("You need to re-run translate_titles_th.py to regenerate TH titles")

    return th_count


def main():
    parser = argparse.ArgumentParser(description='Fix video titles')
    parser.add_argument('--check', action='store_true', help='Check only, no changes')
    parser.add_argument('--fix-en', action='store_true', help='Fix EN titles only')
    parser.add_argument('--fix-all', action='store_true', help='Fix EN and delete TH for re-translation')
    args = parser.parse_args()

    if not any([args.check, args.fix_en, args.fix_all]):
        parser.print_help()
        print("\nPlease specify --check, --fix-en, or --fix-all")
        return

    print("=" * 60)
    print("  Fix Video Titles")
    print("=" * 60)
    print(f"  Mode: {'Check only' if args.check else 'Fix EN' if args.fix_en else 'Fix All'}")
    print(f"  Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    # Load JSON titles
    json_titles = load_json_titles()

    # Connect to database
    conn = psycopg2.connect(**DB_CONFIG)
    print("Database connected!")

    # Check status
    status = check_status(conn, json_titles)

    if args.check:
        print("\n[CHECK MODE] No changes made.")
        conn.close()
        return

    # Confirm before making changes
    if args.fix_en or args.fix_all:
        print(f"\nThis will update {status['en_wrong']:,} EN titles.")
        if args.fix_all:
            print(f"This will also DELETE {status['total_th']:,} TH titles for re-translation.")

        confirm = input("\nProceed? (yes/no): ")
        if confirm.lower() != 'yes':
            print("Cancelled.")
            conn.close()
            return

    # Fix EN titles
    if args.fix_en or args.fix_all:
        fix_en_titles(conn, json_titles)

    # Delete TH titles for re-translation
    if args.fix_all:
        delete_wrong_th_titles(conn)

    # Final status
    print("\n" + "=" * 60)
    print("  Final Status")
    print("=" * 60)
    check_status(conn, json_titles)

    conn.close()
    print("\nDone!")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Parallel Video Import Script
Import videos from JSON files to PostgreSQL with progress bar
"""

import json
import os
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path
from typing import Optional
import hashlib

import psycopg2
from psycopg2.extras import execute_batch, RealDictCursor
from tqdm import tqdm

# Configuration
DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "user": "postgres",
    "password": "postgres",
    "dbname": "subth"
}

R2_PUBLIC_URL = "https://files.subth.com"
DATA_DIR = r"D:\Admin\Desktop\MY PROJECT\_suekk_bot\output"
PROGRESS_FILE = r"D:\Admin\Desktop\MY PROJECT\_suekk_bot\gofiber_subth\import_progress.json"

# Number of parallel workers
WORKERS = 8
BATCH_SIZE = 500


def get_connection():
    """Create a new database connection"""
    return psycopg2.connect(**DB_CONFIG)


def load_progress():
    """Load progress from file"""
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"uploaded_images": {}, "processed_files": []}


def slugify(text: str) -> str:
    """Convert text to slug"""
    import re
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text


def load_json_files(data_dir: str) -> list:
    """Load all JSON files and return items"""
    items = []
    json_files = sorted(Path(data_dir).glob("listings_*.json"))

    print(f"Loading {len(json_files)} JSON files...")
    for json_file in tqdm(json_files, desc="Loading files"):
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            items.extend(data.get('items', []))

    print(f"Loaded {len(items):,} items")
    return items


def get_or_create_entities(conn, items: list) -> tuple:
    """Create categories, makers, casts, tags and return ID maps"""
    print("\n=== Creating entities ===")

    categories = set()
    makers = set()
    casts = set()
    tags = set()

    for item in items:
        if item.get('category'):
            categories.add(item['category'])
        if item.get('maker'):
            makers.add(item['maker'])
        for c in item.get('cast', []):
            if c:
                casts.add(c)
        for t in item.get('tags', []):
            if t:
                tags.add(t)

    cursor = conn.cursor(cursor_factory=RealDictCursor)

    # Create categories
    print(f"Creating {len(categories)} categories...")
    category_map = {}
    for name in tqdm(categories, desc="Categories"):
        cursor.execute("""
            INSERT INTO categories (id, name, slug, video_count, created_at, updated_at)
            VALUES (gen_random_uuid(), %s, %s, 0, NOW(), NOW())
            ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
            RETURNING id
        """, (name, slugify(name)))
        result = cursor.fetchone()
        if result:
            category_map[name] = result['id']
    conn.commit()

    # Create makers
    print(f"Creating {len(makers)} makers...")
    maker_map = {}
    for name in tqdm(makers, desc="Makers"):
        cursor.execute("""
            INSERT INTO makers (id, name, slug, video_count, created_at, updated_at)
            VALUES (gen_random_uuid(), %s, %s, 0, NOW(), NOW())
            ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
            RETURNING id
        """, (name, slugify(name)))
        result = cursor.fetchone()
        if result:
            maker_map[name] = result['id']
    conn.commit()

    # Create casts
    print(f"Creating {len(casts)} casts...")
    cast_map = {}
    for name in tqdm(casts, desc="Casts"):
        cursor.execute("""
            INSERT INTO casts (id, name, slug, video_count, created_at, updated_at)
            VALUES (gen_random_uuid(), %s, %s, 0, NOW(), NOW())
            ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
            RETURNING id
        """, (name, slugify(name)))
        result = cursor.fetchone()
        if result:
            cast_map[name] = result['id']
    conn.commit()

    # Create tags
    print(f"Creating {len(tags)} tags...")
    tag_map = {}
    for name in tqdm(tags, desc="Tags"):
        cursor.execute("""
            INSERT INTO tags (id, name, slug, video_count, created_at)
            VALUES (gen_random_uuid(), %s, %s, 0, NOW())
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
        """, (name, slugify(name)))
        result = cursor.fetchone()
        if result:
            tag_map[name] = result['id']
    conn.commit()

    cursor.close()
    return category_map, maker_map, cast_map, tag_map


def process_video_batch(batch: list, category_map: dict, maker_map: dict,
                        cast_map: dict, tag_map: dict, uploaded_images: dict) -> dict:
    """Process a batch of videos - runs in thread"""
    conn = get_connection()
    cursor = conn.cursor()

    results = {"created": 0, "skipped": 0, "errors": 0}

    for item in batch:
        try:
            source_url = item.get('url', '')
            code = item.get('code', '')

            # Get thumbnail URL - use code for R2 path
            thumbnail = item.get('full_image', '')
            if code and code in uploaded_images:
                thumbnail = uploaded_images[code]

            # Parse date
            release_date = None
            if item.get('date'):
                try:
                    release_date = datetime.strptime(item['date'], '%Y/%m/%d').date()
                except:
                    pass

            # Get foreign keys
            category_id = category_map.get(item.get('category'))
            maker_id = maker_map.get(item.get('maker'))

            # Check if video exists (by source_url)
            video_id = None
            if source_url:
                cursor.execute("SELECT id FROM videos WHERE source_url = %s", (source_url,))
                existing = cursor.fetchone()
                if existing:
                    video_id = existing[0]
                    results['skipped'] += 1

            # Create video if not exists
            if not video_id:
                cursor.execute("""
                    INSERT INTO videos (id, thumbnail, source_url, category_id, maker_id, release_date, views, created_at, updated_at)
                    VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, %s, NOW(), NOW())
                    RETURNING id
                """, (thumbnail, source_url, category_id, maker_id, release_date, item.get('views', 0)))
                result = cursor.fetchone()
                video_id = result[0]
                results['created'] += 1

            # Add translation
            cursor.execute("""
                INSERT INTO video_translations (id, video_id, lang, title, created_at, updated_at)
                VALUES (gen_random_uuid(), %s, 'en', %s, NOW(), NOW())
                ON CONFLICT (video_id, lang) DO UPDATE SET title = EXCLUDED.title, updated_at = NOW()
            """, (video_id, item.get('title', '')))

            # Add casts
            for cast_name in item.get('cast', []):
                if cast_name and cast_name in cast_map:
                    cursor.execute("""
                        INSERT INTO video_casts (video_id, cast_id)
                        VALUES (%s, %s)
                        ON CONFLICT DO NOTHING
                    """, (video_id, cast_map[cast_name]))

            # Add tags
            for tag_name in item.get('tags', []):
                if tag_name and tag_name in tag_map:
                    cursor.execute("""
                        INSERT INTO video_tags (video_id, tag_id)
                        VALUES (%s, %s)
                        ON CONFLICT DO NOTHING
                    """, (video_id, tag_map[tag_name]))

            conn.commit()

        except Exception as e:
            conn.rollback()
            results['errors'] += 1
            # print(f"Error processing {item.get('code', 'unknown')}: {e}")

    cursor.close()
    conn.close()
    return results


def import_videos_parallel(items: list, category_map: dict, maker_map: dict,
                          cast_map: dict, tag_map: dict, uploaded_images: dict):
    """Import videos using parallel workers"""
    print(f"\n=== Importing {len(items):,} videos with {WORKERS} workers ===")

    # Split into batches
    batches = [items[i:i + BATCH_SIZE] for i in range(0, len(items), BATCH_SIZE)]

    total_created = 0
    total_skipped = 0
    total_errors = 0

    with ThreadPoolExecutor(max_workers=WORKERS) as executor:
        futures = {
            executor.submit(
                process_video_batch, batch, category_map, maker_map,
                cast_map, tag_map, uploaded_images
            ): i for i, batch in enumerate(batches)
        }

        with tqdm(total=len(batches), desc="Processing batches") as pbar:
            for future in as_completed(futures):
                result = future.result()
                total_created += result['created']
                total_skipped += result['skipped']
                total_errors += result['errors']
                pbar.set_postfix({
                    'created': total_created,
                    'skipped': total_skipped,
                    'errors': total_errors
                })
                pbar.update(1)

    print(f"\n=== Import Complete ===")
    print(f"  Created: {total_created:,}")
    print(f"  Skipped: {total_skipped:,}")
    print(f"  Errors:  {total_errors:,}")


def update_counts(conn):
    """Update video counts for all entities"""
    print("\n=== Updating counts ===")
    cursor = conn.cursor()

    print("Updating category counts...")
    cursor.execute("""
        UPDATE categories SET video_count = (
            SELECT COUNT(*) FROM videos WHERE videos.category_id = categories.id
        )
    """)

    print("Updating maker counts...")
    cursor.execute("""
        UPDATE makers SET video_count = (
            SELECT COUNT(*) FROM videos WHERE videos.maker_id = makers.id
        )
    """)

    print("Updating cast counts...")
    cursor.execute("""
        UPDATE casts SET video_count = (
            SELECT COUNT(*) FROM video_casts WHERE video_casts.cast_id = casts.id
        )
    """)

    print("Updating tag counts...")
    cursor.execute("""
        UPDATE tags SET video_count = (
            SELECT COUNT(*) FROM video_tags WHERE video_tags.tag_id = tags.id
        )
    """)

    conn.commit()
    cursor.close()
    print("Counts updated!")


def clear_data(conn):
    """Clear existing video data"""
    print("\n=== Clearing existing data ===")
    cursor = conn.cursor()

    tables = ['video_translations', 'video_casts', 'video_tags', 'videos']
    for table in tables:
        print(f"  Clearing {table}...")
        cursor.execute(f"DELETE FROM {table}")

    conn.commit()
    cursor.close()
    print("Data cleared!")


def main():
    print("=" * 60)
    print("  Parallel Video Import")
    print("=" * 60)

    # Load progress (for R2 URLs)
    progress = load_progress()
    uploaded_images = progress.get('uploaded_images', {})
    print(f"Loaded {len(uploaded_images):,} uploaded image URLs")

    # Load items
    items = load_json_files(DATA_DIR)

    # Connect to database
    conn = get_connection()
    print("Database connected!")

    # Clear existing data
    clear_data(conn)

    # Create entities
    category_map, maker_map, cast_map, tag_map = get_or_create_entities(conn, items)

    conn.close()

    # Import videos in parallel
    import_videos_parallel(items, category_map, maker_map, cast_map, tag_map, uploaded_images)

    # Update counts
    conn = get_connection()
    update_counts(conn)
    conn.close()

    # Final stats
    conn = get_connection()
    cursor = conn.cursor()

    print("\n=== Final Database Stats ===")
    for table in ['videos', 'video_translations', 'categories', 'makers', 'casts', 'tags', 'video_casts', 'video_tags']:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        print(f"  {table}: {count:,}")

    cursor.close()
    conn.close()

    print("\n" + "=" * 60)
    print("  Import completed!")
    print("=" * 60)


if __name__ == "__main__":
    main()

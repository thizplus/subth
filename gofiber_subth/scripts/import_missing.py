#!/usr/bin/env python3
"""
Import Missing Videos
Import only the videos that are missing from the database
"""

import json
import psycopg2
from psycopg2.extras import RealDictCursor
from pathlib import Path
from datetime import datetime
from tqdm import tqdm

# Configuration
DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "user": "postgres",
    "password": "postgres",
    "dbname": "subth"
}

DATA_DIR = r"D:\Admin\Desktop\MY PROJECT\_suekk_bot\output"


def slugify(text: str) -> str:
    """Convert text to slug"""
    import re
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text


def main():
    print("=" * 60)
    print("  Import Missing Videos")
    print("=" * 60)

    # Load all items from JSON
    print("\nLoading JSON files...")
    items = []
    json_files = sorted(Path(DATA_DIR).glob("listings_*.json"))
    for f in tqdm(json_files, desc="Loading files"):
        with open(f, 'r', encoding='utf-8') as fp:
            data = json.load(fp)
            items.extend(data.get('items', []))

    print(f"Total items in JSON: {len(items):,}")

    # Connect to database
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    print("Database connected!")

    # Get existing source_urls
    print("\nFetching existing URLs from database...")
    cursor.execute("SELECT source_url FROM videos WHERE source_url IS NOT NULL")
    existing_urls = set(row['source_url'] for row in cursor.fetchall())
    print(f"Existing URLs in DB: {len(existing_urls):,}")

    # Find missing items
    items_by_url = {item.get('url'): item for item in items if item.get('url')}
    missing_urls = [url for url in items_by_url.keys() if url not in existing_urls]
    print(f"Missing items: {len(missing_urls):,}")

    if not missing_urls:
        print("\nNo missing items to import!")
        return

    # Get entity maps
    print("\nLoading entity maps...")

    cursor.execute("SELECT id, name FROM categories")
    category_map = {row['name']: row['id'] for row in cursor.fetchall()}

    cursor.execute("SELECT id, name FROM makers")
    maker_map = {row['name']: row['id'] for row in cursor.fetchall()}

    cursor.execute("SELECT id, name FROM casts")
    cast_map = {row['name']: row['id'] for row in cursor.fetchall()}

    cursor.execute("SELECT id, name FROM tags")
    tag_map = {row['name']: row['id'] for row in cursor.fetchall()}

    print(f"  Categories: {len(category_map)}, Makers: {len(maker_map)}, Casts: {len(cast_map)}, Tags: {len(tag_map)}")

    # Import missing items
    print(f"\nImporting {len(missing_urls):,} missing videos...")
    created = 0
    errors = 0

    for url in tqdm(missing_urls, desc="Importing"):
        item = items_by_url[url]

        try:
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

            # Get thumbnail path
            code = item.get('code')
            thumbnail = f"/thumbnails/{code}.jpg" if code else ""

            # Insert video
            cursor.execute("""
                INSERT INTO videos (id, code, thumbnail, source_url, category_id, maker_id, release_date, views, created_at, updated_at)
                VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                RETURNING id
            """, (code if code else None, thumbnail, url, category_id, maker_id, release_date, item.get('views', 0)))

            result = cursor.fetchone()
            video_id = result['id']

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
            created += 1

        except Exception as e:
            conn.rollback()
            errors += 1
            # print(f"Error: {e}")

    print(f"\n=== Import Complete ===")
    print(f"  Created: {created:,}")
    print(f"  Errors:  {errors:,}")

    # Update counts
    print("\nUpdating counts...")
    cursor.execute("""
        UPDATE categories SET video_count = (
            SELECT COUNT(*) FROM videos WHERE videos.category_id = categories.id
        )
    """)
    cursor.execute("""
        UPDATE makers SET video_count = (
            SELECT COUNT(*) FROM videos WHERE videos.maker_id = makers.id
        )
    """)
    cursor.execute("""
        UPDATE casts SET video_count = (
            SELECT COUNT(*) FROM video_casts WHERE video_casts.cast_id = casts.id
        )
    """)
    cursor.execute("""
        UPDATE tags SET video_count = (
            SELECT COUNT(*) FROM video_tags WHERE video_tags.tag_id = tags.id
        )
    """)
    conn.commit()
    print("Counts updated!")

    # Final stats
    print("\n=== Final Database Stats ===")
    for table in ['videos', 'video_translations', 'categories', 'makers', 'casts', 'tags', 'video_casts', 'video_tags']:
        cursor.execute(f"SELECT COUNT(*) as count FROM {table}")
        count = cursor.fetchone()['count']
        print(f"  {table}: {count:,}")

    cursor.close()
    conn.close()

    print("\n" + "=" * 60)
    print("  Done!")
    print("=" * 60)


if __name__ == "__main__":
    main()

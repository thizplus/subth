#!/usr/bin/env python3
"""
Import all data from db_preview JSON files to PostgreSQL database.
This imports the 143,465 records that were verified to be 100% correct.
"""

import json
import psycopg2
from psycopg2.extras import execute_values
from pathlib import Path
from datetime import datetime
import sys

# Database connection
DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "database": "subth",
    "user": "postgres",
    "password": "postgres"
}

PREVIEW_DIR = Path("D:/Admin/Desktop/MY PROJECT/_suekk_bot/gofiber_subth/scripts/db_preview")

def get_connection():
    return psycopg2.connect(**DB_CONFIG)

def clear_all_tables(conn):
    """Clear all tables in correct order (child tables first)"""
    print("\n[0/8] Clearing existing data...")

    cur = conn.cursor()

    # Delete in order respecting foreign keys
    tables_to_clear = [
        "video_tags",
        "video_casts",
        "video_translations",
        "videos",
        "tag_translations",
        "tags",
        "cast_translations",
        "casts",
        "maker_translations",
        "makers",
        "category_translations",
        "categories",
    ]

    for table in tables_to_clear:
        try:
            cur.execute(f"DELETE FROM {table}")
            count = cur.rowcount
            if count > 0:
                print(f"  Deleted {count:,} rows from {table}")
        except Exception as e:
            print(f"  Skip {table}: {e}")

    conn.commit()
    print("  All tables cleared!")

def import_categories(conn):
    """Import categories table"""
    print("\n[1/8] Importing categories...")

    with open(PREVIEW_DIR / "categories.json", 'r', encoding='utf-8') as f:
        data = json.load(f)

    cur = conn.cursor()
    now = datetime.now()
    values = [(item['id'], item['name'], now, now) for item in data]

    execute_values(
        cur,
        "INSERT INTO categories (id, name, created_at, updated_at) VALUES %s",
        values
    )

    conn.commit()
    print(f"  Imported {len(data)} categories")
    return {item['name']: item['id'] for item in data}

def import_makers(conn):
    """Import makers table"""
    print("\n[2/8] Importing makers...")

    with open(PREVIEW_DIR / "makers.json", 'r', encoding='utf-8') as f:
        data = json.load(f)

    cur = conn.cursor()
    now = datetime.now()
    values = [(item['id'], item['name'], now, now) for item in data]

    execute_values(
        cur,
        "INSERT INTO makers (id, name, created_at, updated_at) VALUES %s",
        values
    )

    conn.commit()
    print(f"  Imported {len(data)} makers")
    return {item['name']: item['id'] for item in data}

def import_casts(conn):
    """Import casts table"""
    print("\n[3/8] Importing casts...")

    with open(PREVIEW_DIR / "casts.json", 'r', encoding='utf-8') as f:
        data = json.load(f)

    cur = conn.cursor()
    now = datetime.now()
    values = [(item['id'], item['name'], now, now) for item in data]

    # Batch insert
    batch_size = 1000
    for i in range(0, len(values), batch_size):
        batch = values[i:i+batch_size]
        execute_values(
            cur,
            "INSERT INTO casts (id, name, created_at, updated_at) VALUES %s",
            batch
        )

    conn.commit()
    print(f"  Imported {len(data)} casts")
    return {item['name']: item['id'] for item in data}

def import_tags(conn):
    """Import tags table"""
    print("\n[4/8] Importing tags...")

    with open(PREVIEW_DIR / "tags.json", 'r', encoding='utf-8') as f:
        data = json.load(f)

    cur = conn.cursor()
    now = datetime.now()
    values = [(item['id'], item['name'], now, now) for item in data]

    execute_values(
        cur,
        "INSERT INTO tags (id, name, created_at, updated_at) VALUES %s",
        values
    )

    conn.commit()
    print(f"  Imported {len(data)} tags")
    return {item['name']: item['id'] for item in data}

def import_videos(conn):
    """Import videos table"""
    print("\n[5/8] Importing videos...")

    cur = conn.cursor()
    total = 0
    now = datetime.now()

    for i in range(1, 16):
        file_path = PREVIEW_DIR / f"videos_{i:02d}.json"
        if not file_path.exists():
            break

        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        values = []
        for item in data:
            release_date = item['release_date'] if item['release_date'] else None
            values.append((
                item['id'],
                item['thumbnail'],
                item['source_url'],
                item['category_id'],
                release_date,
                item['maker_id'],
                item['views'],
                item['auto_tags'],  # PostgreSQL array
                now,
                now
            ))

        # Batch insert
        batch_size = 1000
        for j in range(0, len(values), batch_size):
            batch = values[j:j+batch_size]
            execute_values(
                cur,
                """INSERT INTO videos
                   (id, thumbnail, source_url, category_id, release_date, maker_id, views, auto_tags, created_at, updated_at)
                   VALUES %s""",
                batch
            )

        conn.commit()
        total += len(data)
        print(f"  File {i:02d}: {len(data):,} records (Total: {total:,})")

    print(f"  Imported {total:,} videos")

def import_video_translations(conn):
    """Import video_translations table"""
    print("\n[6/8] Importing video_translations...")

    cur = conn.cursor()
    total = 0
    now = datetime.now()

    for i in range(1, 16):
        file_path = PREVIEW_DIR / f"video_translations_{i:02d}.json"
        if not file_path.exists():
            break

        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        values = [(
            item['id'],
            item['video_id'],
            item['lang'],
            item['title'],
            now,
            now
        ) for item in data]

        # Batch insert
        batch_size = 1000
        for j in range(0, len(values), batch_size):
            batch = values[j:j+batch_size]
            execute_values(
                cur,
                """INSERT INTO video_translations
                   (id, video_id, lang, title, created_at, updated_at)
                   VALUES %s""",
                batch
            )

        conn.commit()
        total += len(data)
        print(f"  File {i:02d}: {len(data):,} records (Total: {total:,})")

    print(f"  Imported {total:,} video_translations")

def import_video_casts(conn):
    """Import video_casts table"""
    print("\n[7/8] Importing video_casts...")

    with open(PREVIEW_DIR / "video_casts.json", 'r', encoding='utf-8') as f:
        data = json.load(f)

    cur = conn.cursor()
    values = [(item['video_id'], item['cast_id']) for item in data]

    # Batch insert
    batch_size = 5000
    for i in range(0, len(values), batch_size):
        batch = values[i:i+batch_size]
        execute_values(
            cur,
            "INSERT INTO video_casts (video_id, cast_id) VALUES %s",
            batch
        )
        if (i + batch_size) % 50000 == 0:
            print(f"  Progress: {min(i + batch_size, len(values)):,}/{len(values):,}")

    conn.commit()
    print(f"  Imported {len(data):,} video_casts")

def import_video_tags(conn):
    """Import video_tags table"""
    print("\n[8/8] Importing video_tags...")

    with open(PREVIEW_DIR / "video_tags.json", 'r', encoding='utf-8') as f:
        data = json.load(f)

    cur = conn.cursor()
    values = [(item['video_id'], item['tag_id']) for item in data]

    # Batch insert
    batch_size = 5000
    for i in range(0, len(values), batch_size):
        batch = values[i:i+batch_size]
        execute_values(
            cur,
            "INSERT INTO video_tags (video_id, tag_id) VALUES %s",
            batch
        )
        if (i + batch_size) % 100000 == 0:
            print(f"  Progress: {min(i + batch_size, len(values)):,}/{len(values):,}")

    conn.commit()
    print(f"  Imported {len(data):,} video_tags")

def verify_counts(conn):
    """Verify record counts after import"""
    print("\n" + "=" * 60)
    print("VERIFICATION")
    print("=" * 60)

    cur = conn.cursor()

    tables = [
        'categories', 'makers', 'casts', 'tags',
        'videos', 'video_translations', 'video_casts', 'video_tags'
    ]

    for table in tables:
        cur.execute(f"SELECT COUNT(*) FROM {table}")
        count = cur.fetchone()[0]
        print(f"  {table}: {count:,} records")

def main():
    print("=" * 60)
    print("IMPORT DATA TO POSTGRESQL")
    print("=" * 60)
    print(f"Source: {PREVIEW_DIR}")
    print(f"Database: {DB_CONFIG['database']}@{DB_CONFIG['host']}")

    try:
        conn = get_connection()
        print("\nConnected to database successfully!")

        # Clear all existing data first
        clear_all_tables(conn)

        # Import in order (respecting foreign keys)
        import_categories(conn)
        import_makers(conn)
        import_casts(conn)
        import_tags(conn)
        import_videos(conn)
        import_video_translations(conn)
        import_video_casts(conn)
        import_video_tags(conn)

        # Verify
        verify_counts(conn)

        conn.close()

        print("\n" + "=" * 60)
        print("IMPORT COMPLETED SUCCESSFULLY!")
        print("=" * 60)

    except Exception as e:
        print(f"\nERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

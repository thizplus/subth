#!/usr/bin/env python3
"""
Export all 140,000++ records to JSON files showing how they will be stored in database.
Generates separate files for each table.
"""

import json
import os
import re
import uuid
from datetime import datetime
from pathlib import Path

# Paths
OUTPUT_DIR = Path("D:/Admin/Desktop/MY PROJECT/_suekk_bot/output")
EXPORT_DIR = Path("D:/Admin/Desktop/MY PROJECT/_suekk_bot/gofiber_subth/scripts/db_preview")

def extract_code_from_title(title: str) -> str:
    """Extract video code from title (e.g., 'ABF-144 Some Title' -> 'ABF-144')"""
    if not title:
        return ""
    match = re.match(r'^([A-Z0-9]+-\d+)', title)
    return match.group(1) if match else ""

def format_date(date_str: str) -> str:
    """Convert date from 2024/08/24 to 2024-08-24"""
    if not date_str:
        return None
    try:
        return date_str.replace("/", "-")
    except:
        return None

def generate_uuid() -> str:
    """Generate a deterministic UUID-like string for preview"""
    return str(uuid.uuid4())

def main():
    print("=" * 60)
    print("Exporting all data to JSON preview files")
    print("=" * 60)

    # Create export directory
    EXPORT_DIR.mkdir(parents=True, exist_ok=True)

    # Data structures
    videos = []
    video_translations = []
    video_casts = []
    video_tags = []

    # Lookup tables (to create UUIDs for related entities)
    categories = {}  # name -> uuid
    makers = {}      # name -> uuid
    casts = {}       # name -> uuid
    tags = {}        # name -> uuid

    # Read all JSON files
    json_files = sorted(OUTPUT_DIR.glob("listings_*.json"))
    total_files = len(json_files)

    print(f"Found {total_files} JSON files to process")

    video_count = 0

    for idx, json_file in enumerate(json_files):
        print(f"Processing {idx+1}/{total_files}: {json_file.name}")

        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Data is in items key
        items = data.get('items', [])
        for item in items:
            video_count += 1

            # Generate UUIDs for this video
            video_id = generate_uuid()

            # Get or create category UUID
            category_name = item.get('category', '')
            if category_name and category_name not in categories:
                categories[category_name] = generate_uuid()
            category_id = categories.get(category_name)

            # Get or create maker UUID
            maker_name = item.get('maker', '')
            if maker_name and maker_name not in makers:
                makers[maker_name] = generate_uuid()
            maker_id = makers.get(maker_name)

            # Extract code from title for thumbnail path
            title = item.get('title', '')
            code = extract_code_from_title(title)
            thumbnail = f"/thumbnails/{code}.jpg" if code else ""

            # Create video record
            video = {
                "id": video_id,
                "thumbnail": thumbnail,
                "source_url": item.get('url', ''),
                "category_id": category_id,
                "release_date": format_date(item.get('date', '')),
                "maker_id": maker_id,
                "views": item.get('views', 0),
                "auto_tags": [],  # Will be filled by AI later
                "created_at": "<current_timestamp>",
                "updated_at": "<current_timestamp>"
            }
            videos.append(video)

            # Create video_translation record (EN)
            translation = {
                "id": generate_uuid(),
                "video_id": video_id,
                "lang": "en",
                "title": title,
                "created_at": "<current_timestamp>",
                "updated_at": "<current_timestamp>"
            }
            video_translations.append(translation)

            # Create video_casts records
            for cast_name in item.get('cast', []):
                if cast_name and cast_name not in casts:
                    casts[cast_name] = generate_uuid()

                video_cast = {
                    "video_id": video_id,
                    "cast_id": casts[cast_name]
                }
                video_casts.append(video_cast)

            # Create video_tags records
            for tag_name in item.get('tags', []):
                if tag_name and tag_name not in tags:
                    tags[tag_name] = generate_uuid()

                video_tag = {
                    "video_id": video_id,
                    "tag_id": tags[tag_name]
                }
                video_tags.append(video_tag)

    print(f"\nTotal videos processed: {video_count}")
    print(f"Unique categories: {len(categories)}")
    print(f"Unique makers: {len(makers)}")
    print(f"Unique casts: {len(casts)}")
    print(f"Unique tags: {len(tags)}")
    print(f"Total video_translations: {len(video_translations)}")
    print(f"Total video_casts: {len(video_casts)}")
    print(f"Total video_tags: {len(video_tags)}")

    # Write categories lookup
    categories_list = [{"id": uid, "name": name} for name, uid in categories.items()]
    with open(EXPORT_DIR / "categories.json", 'w', encoding='utf-8') as f:
        json.dump(categories_list, f, ensure_ascii=False, indent=2)
    print(f"\nWritten: categories.json ({len(categories_list)} records)")

    # Write makers lookup
    makers_list = [{"id": uid, "name": name} for name, uid in makers.items()]
    with open(EXPORT_DIR / "makers.json", 'w', encoding='utf-8') as f:
        json.dump(makers_list, f, ensure_ascii=False, indent=2)
    print(f"Written: makers.json ({len(makers_list)} records)")

    # Write casts lookup
    casts_list = [{"id": uid, "name": name} for name, uid in casts.items()]
    with open(EXPORT_DIR / "casts.json", 'w', encoding='utf-8') as f:
        json.dump(casts_list, f, ensure_ascii=False, indent=2)
    print(f"Written: casts.json ({len(casts_list)} records)")

    # Write tags lookup
    tags_list = [{"id": uid, "name": name} for name, uid in tags.items()]
    with open(EXPORT_DIR / "tags.json", 'w', encoding='utf-8') as f:
        json.dump(tags_list, f, ensure_ascii=False, indent=2)
    print(f"Written: tags.json ({len(tags_list)} records)")

    # Write videos (split into chunks of 10000 for readability)
    chunk_size = 10000
    for i in range(0, len(videos), chunk_size):
        chunk = videos[i:i+chunk_size]
        chunk_num = (i // chunk_size) + 1
        filename = f"videos_{chunk_num:02d}.json"
        with open(EXPORT_DIR / filename, 'w', encoding='utf-8') as f:
            json.dump(chunk, f, ensure_ascii=False, indent=2)
        print(f"Written: {filename} ({len(chunk)} records)")

    # Write video_translations (split into chunks)
    for i in range(0, len(video_translations), chunk_size):
        chunk = video_translations[i:i+chunk_size]
        chunk_num = (i // chunk_size) + 1
        filename = f"video_translations_{chunk_num:02d}.json"
        with open(EXPORT_DIR / filename, 'w', encoding='utf-8') as f:
            json.dump(chunk, f, ensure_ascii=False, indent=2)
        print(f"Written: {filename} ({len(chunk)} records)")

    # Write video_casts (all in one file, it's just video_id + cast_id)
    with open(EXPORT_DIR / "video_casts.json", 'w', encoding='utf-8') as f:
        json.dump(video_casts, f, ensure_ascii=False, indent=2)
    print(f"Written: video_casts.json ({len(video_casts)} records)")

    # Write video_tags
    with open(EXPORT_DIR / "video_tags.json", 'w', encoding='utf-8') as f:
        json.dump(video_tags, f, ensure_ascii=False, indent=2)
    print(f"Written: video_tags.json ({len(video_tags)} records)")

    # Write summary
    summary = {
        "description": "Database Preview - All 140,000++ records",
        "generated_at": datetime.now().isoformat(),
        "statistics": {
            "total_videos": len(videos),
            "total_video_translations": len(video_translations),
            "total_video_casts": len(video_casts),
            "total_video_tags": len(video_tags),
            "unique_categories": len(categories),
            "unique_makers": len(makers),
            "unique_casts": len(casts),
            "unique_tags": len(tags)
        },
        "schema_notes": {
            "videos": "Main video table - NO code field, code extracted from title when needed",
            "video_translations": "Multi-language titles (en, th, ja) - title includes code",
            "video_casts": "Many-to-many: videos <-> casts",
            "video_tags": "Many-to-many: videos <-> tags",
            "categories": "Lookup table for categories",
            "makers": "Lookup table for makers",
            "casts": "Lookup table for cast members",
            "tags": "Lookup table for tags"
        },
        "files_generated": [
            "categories.json",
            "makers.json",
            "casts.json",
            "tags.json",
            f"videos_01.json ... videos_{(len(videos) // chunk_size) + 1:02d}.json",
            f"video_translations_01.json ... video_translations_{(len(video_translations) // chunk_size) + 1:02d}.json",
            "video_casts.json",
            "video_tags.json"
        ]
    }

    with open(EXPORT_DIR / "SUMMARY.json", 'w', encoding='utf-8') as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    print(f"\nWritten: SUMMARY.json")

    print("\n" + "=" * 60)
    print(f"All files written to: {EXPORT_DIR}")
    print("=" * 60)

if __name__ == "__main__":
    main()

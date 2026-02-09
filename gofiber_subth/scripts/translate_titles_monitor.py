#!/usr/bin/env python3
"""
Monitor translation progress
Run: python translate_titles_monitor.py
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import time
import psycopg2

DB_CONFIG = {
    "host": "localhost",
    "port": 5433,
    "user": "postgres",
    "password": "postgres",
    "dbname": "subth"
}


def get_progress():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    # Count Thai translations
    cur.execute("SELECT COUNT(*) FROM video_translations WHERE lang = 'th'")
    done = cur.fetchone()[0]

    # Total videos
    cur.execute("SELECT COUNT(*) FROM videos")
    total = cur.fetchone()[0]

    # Get some recent samples
    cur.execute("""
        SELECT title FROM video_translations
        WHERE lang = 'th'
        ORDER BY created_at DESC
        LIMIT 3
    """)
    samples = [r[0] for r in cur.fetchall()]

    conn.close()
    return done, total, samples


def main():
    print("=" * 60)
    print("  Translation Monitor (Thai Titles)")
    print("  Press Ctrl+C to stop")
    print("=" * 60)

    last_done = 0
    last_time = time.time()

    while True:
        done, total, samples = get_progress()
        pct = (done / total) * 100 if total > 0 else 0
        remaining = total - done

        # Calculate speed
        now = time.time()
        elapsed = now - last_time
        if elapsed > 0 and done > last_done:
            speed = (done - last_done) / elapsed
            eta_seconds = remaining / speed if speed > 0 else 0
            eta_hours = eta_seconds / 3600
            eta_minutes = (eta_seconds % 3600) / 60

            if eta_hours >= 1:
                eta_str = f"{eta_hours:.1f}h"
            else:
                eta_str = f"{eta_minutes:.0f}m"
        else:
            speed = 0
            eta_str = "calculating..."

        # Progress bar
        bar_width = 30
        filled = int(bar_width * done / total) if total > 0 else 0
        bar = "█" * filled + "░" * (bar_width - filled)

        # Clear and print
        print(f"\r[{bar}] {pct:5.1f}% | {done:,}/{total:,} | {speed:.1f}/s | ETA: {eta_str}    ", end="", flush=True)

        # Show samples every 30 seconds
        if int(now) % 30 == 0 and samples:
            print(f"\n  Latest: {samples[0][:50]}...")

        last_done = done
        last_time = now

        if done >= total:
            print("\n\n[OK] Translation complete!")
            break

        time.sleep(5)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nMonitor stopped.")

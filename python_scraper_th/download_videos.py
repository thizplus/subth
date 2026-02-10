# -*- coding: utf-8 -*-
"""
Step 5: Download videos from urls_complete.jsonl
Usage: python download_videos.py <site> [-n MAX_ITEMS] [-w WORKERS] [--no-resume]
"""
import json
import sys
import argparse
import threading
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

from downloaders.mee18 import Mee18Downloader
from downloaders.meeplayer import MeePlayerDownloader
from downloaders.starnewlove import StarNewLoveDownloader
from downloaders.bananaloves import BananaLovesDownloader
from downloaders.cyberpor import CyberPorDownloader
from downloaders.bananaloves_v2 import BananaLovesV2Downloader
from downloaders.travapo import TravapoDownloader
from downloaders.scglit import ScglitDownloader
from downloaders.barlow import BarlowDownloader

# ============ CONFIG ============
BASE_DIR = Path(__file__).parent
TEMP_DIR = BASE_DIR / 'temp'
DEFAULT_WORKERS = 3  # จำนวน video ที่โหลดพร้อมกัน
# ================================

# Thread-safe counters
class Counter:
    def __init__(self):
        self.success = 0
        self.failed = 0
        self.skipped = 0
        self._lock = threading.Lock()

    def add_success(self):
        with self._lock:
            self.success += 1

    def add_failed(self):
        with self._lock:
            self.failed += 1

    def add_skipped(self):
        with self._lock:
            self.skipped += 1


def download_single(record: dict, site: str, output_dir: Path, counter: Counter, idx: int, total: int):
    """Download a single video"""
    post_id = record['id']
    video_hash = record['video_hash']
    player = record.get('player', 'unknown')

    output_file = output_dir / f"{site}_{post_id}.mp4"

    # Create separate temp dir per thread to avoid conflicts
    temp_dir = output_dir.parent / 'download_temp' / str(post_id)
    temp_dir.mkdir(parents=True, exist_ok=True)

    print(f"[{idx}/{total}] Starting {site}_{post_id} [{player}]")

    try:
        if player == 'mee18player':
            downloader = Mee18Downloader(temp_dir=temp_dir)
            result = downloader.download(video_hash, str(output_file))
        elif player == 'meeplayer':
            downloader = MeePlayerDownloader(temp_dir=temp_dir)
            result = downloader.download(video_hash, str(output_file))
        elif player == 'starnewlove':
            downloader = StarNewLoveDownloader(temp_dir=temp_dir)
            result = downloader.download(video_hash, str(output_file))
        elif player == 'bananaloves':
            downloader = BananaLovesDownloader(temp_dir=temp_dir)
            video_url = record.get('video_url')
            video_name = record.get('video_name')
            result = downloader.download(video_hash, str(output_file), video_name=video_name, video_url=video_url)
        elif player == 'cyberpor':
            downloader = CyberPorDownloader(temp_dir=temp_dir)
            video_url = record.get('video_url')
            result = downloader.download(video_hash, str(output_file), video_url=video_url)
        elif player == 'bananaloves_v2':
            downloader = BananaLovesV2Downloader(temp_dir=temp_dir)
            video_url = record.get('video_url')
            result = downloader.download(video_hash, str(output_file), video_url=video_url)
        elif player == 'travapo':
            downloader = TravapoDownloader(temp_dir=temp_dir)
            video_url = record.get('video_url')
            result = downloader.download(video_hash, str(output_file), video_url=video_url)
        elif player == 'scglit':
            downloader = ScglitDownloader(temp_dir=temp_dir)
            video_url = record.get('video_url')
            result = downloader.download(video_hash, str(output_file), video_url=video_url)
        elif player == 'barlow':
            downloader = BarlowDownloader(temp_dir=temp_dir)
            video_url = record.get('video_url')
            result = downloader.download(video_hash, str(output_file), video_url=video_url)
        else:
            print(f"[{idx}/{total}] SKIP {post_id} - unknown player: {player}")
            counter.add_skipped()
            return False

        if result and output_file.exists():
            size_mb = output_file.stat().st_size / (1024 * 1024)
            print(f"[{idx}/{total}] OK {site}_{post_id} ({size_mb:.1f} MB)")
            counter.add_success()
            return True
        else:
            print(f"[{idx}/{total}] FAILED {site}_{post_id}")
            counter.add_failed()
            return False

    except Exception as e:
        print(f"[{idx}/{total}] ERROR {site}_{post_id}: {str(e)[:50]}")
        counter.add_failed()
        return False


def download_videos(site: str, max_items: int = 0, workers: int = DEFAULT_WORKERS, resume: bool = True):
    """Download videos for a site with parallel workers"""

    site_dir = TEMP_DIR / site
    input_file = site_dir / 'urls_complete.jsonl'
    output_dir = site_dir / 'videos'
    output_dir.mkdir(parents=True, exist_ok=True)

    if not input_file.exists():
        print(f"[{site}] urls_complete.jsonl not found")
        print(f"  Run: python collect_details.py {site}")
        return 0

    # Load records
    records = []
    with open(input_file, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                records.append(json.loads(line))

    print(f"[{site}] Total records: {len(records)}")

    # Filter records with video_hash
    with_video = [r for r in records if r.get('video_hash')]
    print(f"[{site}] With video: {len(with_video)}")

    # Check already downloaded
    downloaded = set()
    if resume:
        for f in output_dir.glob('*.mp4'):
            name = f.stem
            if name.startswith(f"{site}_"):
                vid_id = name[len(site)+1:]
            else:
                vid_id = name
            try:
                downloaded.add(int(vid_id))
            except:
                downloaded.add(vid_id)

    print(f"[{site}] Already downloaded: {len(downloaded)}")

    # Filter to download
    to_download = [r for r in with_video if r['id'] not in downloaded]

    if max_items > 0:
        to_download = to_download[:max_items]

    print(f"[{site}] To download: {len(to_download)}")
    print(f"[{site}] Workers: {workers}")

    if not to_download:
        print("Nothing to download!")
        return 0

    counter = Counter()
    total = len(to_download)

    print()
    print(f"Starting parallel download ({workers} workers)...")
    print("=" * 60)

    start_time = datetime.now()

    try:
        with ThreadPoolExecutor(max_workers=workers) as executor:
            futures = {
                executor.submit(download_single, record, site, output_dir, counter, idx, total): record
                for idx, record in enumerate(to_download, 1)
            }

            for future in as_completed(futures):
                pass  # Results already handled in download_single

    except KeyboardInterrupt:
        print("\n\nInterrupted by user - waiting for current downloads to finish...")

    elapsed = (datetime.now() - start_time).total_seconds()

    print()
    print("=" * 60)
    print(f"[{site}] Download Summary:")
    print(f"  Success: {counter.success}")
    print(f"  Failed: {counter.failed}")
    print(f"  Skipped: {counter.skipped}")
    print(f"  Time: {elapsed:.1f}s ({elapsed/60:.1f}m)")
    if counter.success > 0:
        print(f"  Avg: {elapsed/counter.success:.1f}s per video")
    print(f"  Output: {output_dir}")

    return counter.success


def main():
    parser = argparse.ArgumentParser(description='Download videos from urls_complete.jsonl')
    parser.add_argument('site', help='Site name')
    parser.add_argument('-n', '--max-items', type=int, default=0, help='Max items (0=all)')
    parser.add_argument('-w', '--workers', type=int, default=DEFAULT_WORKERS, help=f'Parallel downloads (default: {DEFAULT_WORKERS})')
    parser.add_argument('--no-resume', action='store_true', help='Start fresh')

    args = parser.parse_args()

    print("=" * 60)
    print(f"STEP 5: DOWNLOAD VIDEOS - {args.site}")
    print("=" * 60)
    print()

    download_videos(
        site=args.site,
        max_items=args.max_items,
        workers=args.workers,
        resume=not args.no_resume
    )


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    main()

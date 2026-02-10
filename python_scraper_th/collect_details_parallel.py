# -*- coding: utf-8 -*-
"""
Parallel Detail Collector - เก็บ video URLs หลาย pages พร้อมกัน
Usage: python collect_details_parallel.py <site> --workers 4 [-n MAX_ITEMS]
"""
import json
import time
import sys
import argparse
from pathlib import Path
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock
import queue

try:
    from DrissionPage import ChromiumPage, ChromiumOptions
except ImportError:
    print("DrissionPage not installed. Run: pip install DrissionPage")
    sys.exit(1)

# ============ CONFIG ============
SITES_CONFIG = {
    'badems': {'port': 9225},
    'heehorm': {'port': 9226},
    'leahee': {'port': 9224},
    'madoohee': {'port': 9227},
    'ponhub': {'port': 9228},
    'yeddee': {'port': 9229},
    'taknai': {'port': 9230},
    'scglit': {'port': 9231},
}

BASE_DIR = Path(__file__).parent
TEMP_DIR = BASE_DIR / 'temp'
# ================================

# Thread-safe
file_lock = Lock()
stats = {'success': 0, 'no_video': 0, 'failed': 0}
stats_lock = Lock()


def get_browser(port: int, headless: bool = True) -> ChromiumPage:
    options = ChromiumOptions()
    options.set_local_port(port)
    options.set_argument('--remote-debugging-port', str(port))
    if headless:
        options.set_argument('--headless')
    return ChromiumPage(options)


def extract_detail_data(browser) -> dict:
    """Extract tags and video hash from detail page"""
    js_code = r'''
    const result = {
        tags: [],
        video_hash: null,
        video_url: null,
        video_iframe: null,
        player: null,
        final_url: window.location.href
    };

    // Extract tags
    const tagLinks = document.querySelectorAll('a[href*="/tag/"]');
    const seenTags = new Set();
    tagLinks.forEach(a => {
        const text = a.textContent.trim();
        if (text && text.length < 50 && !seenTags.has(text.toLowerCase())) {
            seenTags.add(text.toLowerCase());
            result.tags.push(text);
        }
    });

    const pageHtml = document.body.innerHTML;

    // Pattern 1: mee18player
    const mee18Match = pageHtml.match(/mee18player\.com\/(?:play|e)\/([a-f0-9]{32})/i);
    if (mee18Match) {
        result.video_hash = mee18Match[1];
        result.player = 'mee18player';
        result.video_url = 'https://player2.mee18player.com/proxy/hls/' + mee18Match[1] + '/master';
    }

    // Pattern 2: meeplayer
    if (!result.video_hash) {
        const meeMatch = pageHtml.match(/meeplayer\.com\/play\/([a-f0-9]{32})/i);
        if (meeMatch) {
            result.video_hash = meeMatch[1];
            result.player = 'meeplayer';
            result.video_url = 'https://meeplayer.com/hlsr2/' + meeMatch[1] + '/master';
        }
    }

    // Pattern 3: starnewlove
    if (!result.video_hash) {
        const spaMatch = pageHtml.match(/spa\.starnewlove\.com\/hls\/([a-f0-9\-]{36})\/master\.m3u8/i);
        if (spaMatch) {
            result.video_hash = spaMatch[1];
            result.player = 'starnewlove';
            result.video_url = 'https://spa.starnewlove.com/hls/' + spaMatch[1] + '/master.m3u8';
        }
    }

    // Pattern 4: plyxxx
    if (!result.video_hash) {
        const plyMatch = pageHtml.match(/plyxxx\.com\/play\/([a-f0-9\-]{36})/i);
        if (plyMatch) {
            result.video_hash = plyMatch[1];
            result.player = 'starnewlove';
            result.video_url = 'https://spa.starnewlove.com/hls/' + plyMatch[1] + '/master.m3u8';
        }
    }

    // Pattern 5: bananaloves
    if (!result.video_hash) {
        const bananaMatch = pageHtml.match(/(?:www\.)?bananaloves\.com\/videoPageNew\/([a-f0-9\-]{36})\/([^"'\s<>]+)/i);
        if (bananaMatch) {
            result.video_hash = bananaMatch[1];
            result.video_name = bananaMatch[2];
            result.player = 'bananaloves';
            result.video_url = 'https://pub-04c5fada6b0a46559ba811a64d68168b.r2.dev/storages/videos/' + bananaMatch[1] + '/websites/' + encodeURIComponent(bananaMatch[2]) + '/index.m3u8';
        }
    }

    // Pattern 6: cyberpor
    if (!result.video_hash) {
        const cyberMatch = pageHtml.match(/cyberpor\.com\/plyr\/([a-f0-9\-]{36})/i);
        if (cyberMatch) {
            result.video_hash = cyberMatch[1];
            result.player = 'cyberpor';
            result.video_url = 'https://cyberpor.com/player/' + cyberMatch[1] + '/playlist.m3u8';
        }
    }

    // Pattern 7: bananaloves v2
    if (!result.video_hash) {
        const bananaV2Match = pageHtml.match(/(?:www\.)?bananaloves\.com\/videoPage\/(\d+)/i);
        if (bananaV2Match) {
            result.video_hash = bananaV2Match[1];
            result.player = 'bananaloves_v2';
            result.video_url = 'https://www.bananaloves.com/video/' + bananaV2Match[1];
        }
    }

    // Pattern 8: cyberlumina/travapo
    if (!result.video_hash) {
        const cyberlumiMatch = pageHtml.match(/cyberlumina\.com\/player\/([a-f0-9\-]{36})/i);
        if (cyberlumiMatch) {
            result.video_hash = cyberlumiMatch[1];
            result.player = 'travapo';
            result.video_url = 'https://ap.travapo.com/' + cyberlumiMatch[1] + '/files/playlist.m3u8';
        }
    }

    // Pattern 8b: barlow-master (taknai new)
    if (!result.video_hash) {
        const barlowHashMatch = pageHtml.match(/master\.barlow-master\.com\/(?:player|api\/player)\/([a-f0-9]{32})/i);
        if (barlowHashMatch) {
            result.video_hash = barlowHashMatch[1];
            result.player = 'barlow';
            result.video_url = 'https://master.barlow-master.com/api/player/' + barlowHashMatch[1] + '.m3u8';
        }
    }

    // Pattern 8c: barlow iframe
    if (!result.video_hash) {
        const barlowIframeMatch = pageHtml.match(/major\.barlow-master\.com\/player\/([A-Za-z0-9]+)/i);
        if (barlowIframeMatch) {
            result.video_hash = barlowIframeMatch[1];
            result.player = 'barlow_iframe';
            result.video_iframe = 'https://major.barlow-master.com/player/' + barlowIframeMatch[1];
        }
    }

    // Pattern 9: scglit hidden input
    if (!result.video_hash) {
        const scglitInput = document.querySelector('input[type="hidden"][value*="/GL/"]');
        if (scglitInput) {
            const videoPath = scglitInput.value;
            result.video_hash = videoPath;
            result.player = 'scglit';
            result.video_url = 'https://bdbx5i74v8f9pk2i.010014.xyz/g' + videoPath + '.mp4/playlist.m3u8';
        }
    }

    // Pattern 9b: scglit iframe
    if (!result.video_hash) {
        const scglitMatch = pageHtml.match(/scglit\.com\/clip\/player\.php\?id=(\d+)/i);
        if (scglitMatch) {
            result.video_hash = scglitMatch[1];
            result.player = 'scglit_iframe';
            result.video_iframe = 'https://scglit.com/clip/player.php?id=' + scglitMatch[1];
        }
    }

    return JSON.stringify(result);
    '''
    try:
        result = browser.run_js(js_code)
        return json.loads(result) if result else {}
    except:
        return {}


def extract_scglit_from_iframe(browser) -> dict:
    """Extract video path from scglit iframe"""
    try:
        iframe = browser.ele('tag:iframe@id=ifrplayer')
        if not iframe:
            iframe = browser.ele('tag:iframe@src:player.php')
        if not iframe:
            return {}

        js_code = '''
        const result = { video_hash: null, video_url: null, player: 'scglit' };
        const urlxInput = document.getElementById('urlx');
        if (urlxInput && urlxInput.value) {
            let videoPath = urlxInput.value;
            if (videoPath.endsWith('.mp4')) {
                videoPath = videoPath.slice(0, -4);
            }
            result.video_hash = videoPath;
            result.video_url = 'https://bdbx5i74v8f9pk2i.010014.xyz/g' + videoPath + '.mp4/playlist.m3u8';
        }
        return JSON.stringify(result);
        '''
        result = iframe.run_js(js_code)
        return json.loads(result) if result else {}
    except:
        return {}


def extract_barlow_from_iframe(browser) -> dict:
    """Extract video hash from barlow-master iframe"""
    try:
        iframe = browser.ele('tag:iframe@src:barlow-master.com')
        if not iframe:
            return {}

        js_code = '''
        const result = { video_hash: null, video_url: null, player: 'barlow' };
        const urlMatch = window.location.href.match(/\\/player\\/([a-f0-9]{32})/i);
        if (urlMatch) {
            result.video_hash = urlMatch[1];
            result.video_url = 'https://master.barlow-master.com/api/player/' + urlMatch[1] + '.m3u8';
        }
        if (!result.video_hash) {
            const html = document.body.innerHTML || '';
            const m3u8Match = html.match(/api\\/player\\/([a-f0-9]{32})\\.m3u8/i);
            if (m3u8Match) {
                result.video_hash = m3u8Match[1];
                result.video_url = 'https://master.barlow-master.com/api/player/' + m3u8Match[1] + '.m3u8';
            }
        }
        return JSON.stringify(result);
        '''
        result = iframe.run_js(js_code)
        return json.loads(result) if result else {}
    except:
        return {}


def process_batch(records: list, worker_id: int, base_port: int, output_file: Path, headless: bool = True):
    """Process a batch of records with one browser instance"""
    browser = None
    results = []

    try:
        port = base_port + worker_id
        browser = get_browser(port, headless)

        # Init session
        if records:
            first_link = records[0]['link']
            base_url = '/'.join(first_link.split('/')[:3])
            browser.get(base_url)
            time.sleep(2)

        for i, record in enumerate(records):
            post_id = record['id']
            link = record['link']

            try:
                browser.get(link)
                time.sleep(1.5)

                # Quick scroll
                browser.run_js('window.scrollTo(0, document.body.scrollHeight / 2);')
                time.sleep(0.5)

                detail = extract_detail_data(browser)

                # Handle scglit iframe
                if detail.get('player') == 'scglit_iframe':
                    scglit_detail = extract_scglit_from_iframe(browser)
                    if scglit_detail.get('video_hash'):
                        detail['video_hash'] = scglit_detail['video_hash']
                        detail['video_url'] = scglit_detail['video_url']
                        detail['player'] = 'scglit'

                # Handle barlow iframe
                if detail.get('player') == 'barlow_iframe':
                    barlow_detail = extract_barlow_from_iframe(browser)
                    if barlow_detail.get('video_hash'):
                        detail['video_hash'] = barlow_detail['video_hash']
                        detail['video_url'] = barlow_detail['video_url']
                        detail['player'] = 'barlow'

                complete_record = {
                    **record,
                    'tags': detail.get('tags', []),
                    'video_hash': detail.get('video_hash'),
                    'video_url': detail.get('video_url'),
                    'player': detail.get('player'),
                    'video_iframe': detail.get('video_iframe'),
                    'final_url': detail.get('final_url', link),
                    'scraped_at': datetime.now().isoformat()
                }

                # Write immediately with lock
                with file_lock:
                    with open(output_file, 'a', encoding='utf-8') as f:
                        f.write(json.dumps(complete_record, ensure_ascii=False) + '\n')

                if detail.get('video_hash'):
                    with stats_lock:
                        stats['success'] += 1
                    status = f"OK [{detail.get('player', '?')}]"
                else:
                    with stats_lock:
                        stats['no_video'] += 1
                    status = "NO VIDEO"

                print(f"[W{worker_id}] {i+1}/{len(records)} ID {post_id}: {status}")

            except Exception as e:
                with stats_lock:
                    stats['failed'] += 1
                print(f"[W{worker_id}] {i+1}/{len(records)} ID {post_id}: ERROR {str(e)[:30]}")

    except Exception as e:
        print(f"[W{worker_id}] Fatal error: {e}")
    finally:
        if browser:
            try:
                browser.quit()
            except:
                pass

    return results


def collect_details_parallel(site: str, workers: int = 4, max_items: int = 0, resume: bool = True, headless: bool = True):
    """Collect details with parallel workers"""

    if site not in SITES_CONFIG:
        print(f"Site '{site}' not configured")
        return

    config = SITES_CONFIG[site]
    site_dir = TEMP_DIR / site
    urls_file = site_dir / 'urls.jsonl'
    output_file = site_dir / 'urls_complete.jsonl'

    if not urls_file.exists():
        print(f"urls.jsonl not found for {site}")
        return

    # Load records
    records = []
    with open(urls_file, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                records.append(json.loads(line))

    print(f"Total records: {len(records)}")

    # Load processed
    processed_ids = set()
    if resume and output_file.exists():
        with open(output_file, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    processed_ids.add(json.loads(line).get('id'))
        print(f"Already processed: {len(processed_ids)}")

    # Filter
    to_process = [r for r in records if r['id'] not in processed_ids and r.get('link')]

    if max_items > 0:
        to_process = to_process[:max_items]

    print(f"To process: {len(to_process)}")
    print(f"Workers: {workers}")
    print()

    if not to_process:
        print("Nothing to process!")
        return

    # Divide among workers
    batch_size = len(to_process) // workers
    batches = []
    for i in range(workers):
        start = i * batch_size
        if i == workers - 1:
            end = len(to_process)
        else:
            end = start + batch_size
        batches.append(to_process[start:end])

    print(f"Batch sizes: {[len(b) for b in batches]}")
    print("=" * 60)

    start_time = time.time()

    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = []
        for i, batch in enumerate(batches):
            if batch:
                future = executor.submit(
                    process_batch,
                    batch,
                    i,
                    config['port'],
                    output_file,
                    headless
                )
                futures.append(future)

        for future in as_completed(futures):
            try:
                future.result()
            except Exception as e:
                print(f"Worker error: {e}")

    elapsed = time.time() - start_time

    print()
    print("=" * 60)
    print(f"Summary:")
    print(f"  Success (with video): {stats['success']}")
    print(f"  No video: {stats['no_video']}")
    print(f"  Failed: {stats['failed']}")
    print(f"  Time: {elapsed:.1f}s ({elapsed/60:.1f}m)")
    if stats['success'] > 0:
        print(f"  Avg: {elapsed/(stats['success']+stats['no_video']+stats['failed']):.2f}s per item")
    print(f"  Output: {output_file}")


def main():
    parser = argparse.ArgumentParser(description='Parallel Detail Collector')
    parser.add_argument('site', choices=SITES_CONFIG.keys(), help='Site name')
    parser.add_argument('-w', '--workers', type=int, default=4, help='Number of workers')
    parser.add_argument('-n', '--max-items', type=int, default=0, help='Max items (0=all)')
    parser.add_argument('--no-resume', action='store_true', help='Start fresh')
    parser.add_argument('--no-headless', action='store_true', help='Show browser windows')

    args = parser.parse_args()

    print("=" * 60)
    print(f"PARALLEL DETAIL COLLECTOR - {args.site}")
    print("=" * 60)
    print()

    collect_details_parallel(
        site=args.site,
        workers=args.workers,
        max_items=args.max_items,
        resume=not args.no_resume,
        headless=not args.no_headless
    )


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    main()

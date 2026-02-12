# -*- coding: utf-8 -*-
"""
Step 4: Collect detail page data (tags, video_hash)
Usage: python collect_details.py <site> [-n MAX_ITEMS] [--no-resume]
"""
import json
import time
import sys
import re
import argparse
from pathlib import Path
from datetime import datetime

try:
    from DrissionPage import ChromiumPage, ChromiumOptions
except ImportError:
    print("DrissionPage not installed. Run: pip install DrissionPage")
    sys.exit(1)

# ============ CONFIG ============
SITES_CONFIG = {
    'badems': {
        'port': 9225,
        'video_pattern': r'mee18player\.com/(?:play|e)/([a-f0-9]{32})',
        'video_url_template': 'https://player2.mee18player.com/proxy/hls/{hash}/master',
        'player': 'mee18player',
    },
    'heehorm': {
        'port': 9226,
        'video_pattern': r'(mee18player|meeplayer)\.com/(?:play|e)/([a-f0-9]{32})',
        'player': 'auto',  # จะ detect จาก page HTML
    },
    'leahee': {
        'port': 9224,
        'player': 'auto',  # จะ detect จาก page HTML (bananaloves)
    },
    'yeddee': {
        'port': 9229,
        'player': 'auto',  # จะ detect จาก page HTML (bananaloves v2)
    },
    'taknai': {
        'port': 9230,
        'player': 'auto',  # จะ detect จาก page HTML (cyberlumina)
    },
    'scglit': {
        'port': 9231,
        'player': 'auto',  # จะ detect จาก page HTML (scglit player.php)
    },
    'joodgangtad': {
        'port': 9232,
        'player': 'auto',  # จะ detect จาก page HTML
    },
    'jedyub': {
        'port': 9233,
        'player': 'auto',  # จะ detect จาก page HTML
    },
}

BASE_DIR = Path(__file__).parent
TEMP_DIR = BASE_DIR / 'temp'
# ================================


def get_browser(port: int) -> ChromiumPage:
    options = ChromiumOptions()
    options.set_local_port(port)
    return ChromiumPage(options)


def extract_detail_data(browser, config: dict) -> dict:
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

    // Extract tags from links containing "tag" in href
    const tagLinks = document.querySelectorAll('a[href*="/tag/"]');
    const seenTags = new Set();
    tagLinks.forEach(a => {
        const text = a.textContent.trim();
        if (text && text.length < 50 && !seenTags.has(text.toLowerCase())) {
            seenTags.add(text.toLowerCase());
            result.tags.push(text);
        }
    });

    // Extract video iframe
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
        const src = iframe.src || iframe.getAttribute('data-src') || '';
        if (src.includes('mee18player') || src.includes('meeplayer') || src.includes('player')) {
            result.video_iframe = src;
        }
    });

    const pageHtml = document.body.innerHTML;

    // Pattern 1: mee18player.com/play/{hash}
    const mee18Match = pageHtml.match(/mee18player\.com\/(?:play|e)\/([a-f0-9]{32})/i);
    if (mee18Match) {
        result.video_hash = mee18Match[1];
        result.player = 'mee18player';
        result.video_url = 'https://player2.mee18player.com/proxy/hls/' + mee18Match[1] + '/master';
    }

    // Pattern 2: meeplayer.com/play/{hash} → hlsr2/{hash}/master
    if (!result.video_hash) {
        const meeMatch = pageHtml.match(/meeplayer\.com\/play\/([a-f0-9]{32})/i);
        if (meeMatch) {
            result.video_hash = meeMatch[1];
            result.player = 'meeplayer';
            result.video_url = 'https://meeplayer.com/hlsr2/' + meeMatch[1] + '/master';
        }
    }

    // Pattern 3: spa.starnewlove.com/hls/{uuid}/master.m3u8 (direct)
    if (!result.video_hash) {
        const spaMatch = pageHtml.match(/spa\.starnewlove\.com\/hls\/([a-f0-9\-]{36})\/master\.m3u8/i);
        if (spaMatch) {
            result.video_hash = spaMatch[1];
            result.player = 'starnewlove';
            result.video_url = 'https://spa.starnewlove.com/hls/' + spaMatch[1] + '/master.m3u8';
        }
    }

    // Pattern 4: plyxxx.com/play/{uuid} (heehorm iframe) → starnewlove
    if (!result.video_hash) {
        const plyMatch = pageHtml.match(/plyxxx\.com\/play\/([a-f0-9\-]{36})/i);
        if (plyMatch) {
            result.video_hash = plyMatch[1];
            result.player = 'starnewlove';
            result.video_url = 'https://spa.starnewlove.com/hls/' + plyMatch[1] + '/master.m3u8';
        }
    }

    // Pattern 5: bananaloves.com/videoPageNew/{uuid}/{name} (leahee) → R2 storage
    if (!result.video_hash) {
        const bananaMatch = pageHtml.match(/(?:www\.)?bananaloves\.com\/videoPageNew\/([a-f0-9\-]{36})\/([^"'\s<>]+)/i);
        if (bananaMatch) {
            result.video_hash = bananaMatch[1];
            result.video_name = bananaMatch[2];
            result.player = 'bananaloves';
            result.video_url = 'https://pub-04c5fada6b0a46559ba811a64d68168b.r2.dev/storages/videos/' + bananaMatch[1] + '/websites/' + encodeURIComponent(bananaMatch[2]) + '/index.m3u8';
        }
    }

    // Pattern 6: cyberpor.com/plyr/{uuid} (madoohee) → cyberpor player
    if (!result.video_hash) {
        const cyberMatch = pageHtml.match(/cyberpor\.com\/plyr\/([a-f0-9\-]{36})/i);
        if (cyberMatch) {
            result.video_hash = cyberMatch[1];
            result.player = 'cyberpor';
            result.video_url = 'https://cyberpor.com/player/' + cyberMatch[1] + '/playlist.m3u8';
        }
    }

    // Pattern 7: bananaloves.com/videoPage/{numeric_id} (yeddee, leahee) → bananaloves v2
    if (!result.video_hash) {
        const bananaV2Match = pageHtml.match(/(?:www\.)?bananaloves\.com\/videoPage\/(\d+)/i);
        if (bananaV2Match) {
            result.video_hash = bananaV2Match[1];
            result.player = 'bananaloves_v2';
            result.video_url = 'https://www.bananaloves.com/video/' + bananaV2Match[1];
        }
    }

    // Pattern 8: cyberlumina.com/player/{uuid} (taknai old) → travapo HLS
    if (!result.video_hash) {
        const cyberlumiMatch = pageHtml.match(/cyberlumina\.com\/player\/([a-f0-9\-]{36})/i);
        if (cyberlumiMatch) {
            result.video_hash = cyberlumiMatch[1];
            result.player = 'travapo';
            result.video_url = 'https://ap.travapo.com/' + cyberlumiMatch[1] + '/files/playlist.m3u8';
        }
    }

    // Pattern 8b: barlow-master.com (taknai new) → barlow HLS
    if (!result.video_hash) {
        // Try to find hash directly in page (32 char hex)
        const barlowHashMatch = pageHtml.match(/master\.barlow-master\.com\/(?:player|api\/player)\/([a-f0-9]{32})/i);
        if (barlowHashMatch) {
            result.video_hash = barlowHashMatch[1];
            result.player = 'barlow';
            result.video_url = 'https://master.barlow-master.com/api/player/' + barlowHashMatch[1] + '.m3u8';
        }
    }

    // Pattern 8c: barlow-master iframe (need to access iframe to get hash)
    if (!result.video_hash) {
        const barlowIframeMatch = pageHtml.match(/major\.barlow-master\.com\/player\/([A-Za-z0-9]+)/i);
        if (barlowIframeMatch) {
            result.video_hash = barlowIframeMatch[1];  // short_id, will resolve in iframe
            result.player = 'barlow_iframe';
            result.video_iframe = 'https://major.barlow-master.com/player/' + barlowIframeMatch[1];
        }
    }

    // Pattern 9: scglit hidden input with video path like /GL/2026/2/Z11398
    if (!result.video_hash) {
        const scglitInput = document.querySelector('input[type="hidden"][value*="/GL/"]');
        if (scglitInput) {
            const videoPath = scglitInput.value;  // e.g., /GL/2026/2/Z11398
            result.video_hash = videoPath;
            result.player = 'scglit';
            result.video_url = 'https://bdbx5i74v8f9pk2i.010014.xyz/g' + videoPath + '.mp4/playlist.m3u8';
        }
    }

    // Pattern 9b: fallback - scglit iframe
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
    except Exception as e:
        print(f"JS Error: {e}")
        return {}


def extract_scglit_from_iframe(browser) -> dict:
    """
    Extract video path from scglit iframe by running JS inside iframe context.
    Must be called while on the detail page with the iframe loaded.
    Returns dict with video_hash, video_url, player
    """
    try:
        # Find the player iframe element
        iframe = browser.ele('tag:iframe@id=ifrplayer')
        if not iframe:
            iframe = browser.ele('tag:iframe@src:player.php')

        if not iframe:
            return {}

        # Run JavaScript inside the iframe context
        js_code = '''
        const result = { video_hash: null, video_url: null, player: 'scglit' };

        // Find hidden input with video path
        const urlxInput = document.getElementById('urlx');
        if (urlxInput && urlxInput.value) {
            let videoPath = urlxInput.value;  // e.g., /GL/2026/2/Z11410.mp4
            // Remove .mp4 extension if present
            if (videoPath.endsWith('.mp4')) {
                videoPath = videoPath.slice(0, -4);
            }
            result.video_hash = videoPath;
        }

        // Fallback: search scripts for video URL
        if (!result.video_hash) {
            const scripts = document.querySelectorAll('script');
            for (const script of scripts) {
                const content = script.innerHTML || '';
                const match = content.match(/\\/GL\\/[^"'\\s]+\\.mp4/);
                if (match) {
                    let videoPath = match[0];
                    if (videoPath.endsWith('.mp4')) {
                        videoPath = videoPath.slice(0, -4);
                    }
                    result.video_hash = videoPath;
                    break;
                }
            }
        }

        // Extract actual CDN URL from script if available
        if (result.video_hash) {
            const scripts = document.querySelectorAll('script');
            for (const script of scripts) {
                const content = script.innerHTML || '';
                const urlMatch = content.match(/(https:\\/\\/[^"'\\s]+\\.001140\\.xyz[^"'\\s]+playlist\\.m3u8)/);
                if (urlMatch) {
                    result.video_url = urlMatch[1];
                    break;
                }
            }
            // Fallback to default CDN
            if (!result.video_url) {
                result.video_url = 'https://bdbx5i74v8f9pk2i.010014.xyz/g' + result.video_hash + '.mp4/playlist.m3u8';
            }
        }

        return JSON.stringify(result);
        '''

        result = iframe.run_js(js_code)
        return json.loads(result) if result else {}

    except Exception as e:
        print(f"Scglit iframe error: {e}")
        return {}


def extract_barlow_from_iframe(browser) -> dict:
    """
    Extract video hash from barlow-master iframe.
    The iframe loads master.barlow-master.com/player/{hash}
    """
    try:
        # Find the barlow iframe
        iframe = browser.ele('tag:iframe@src:barlow-master.com')
        if not iframe:
            return {}

        # Run JavaScript inside the iframe to find the hash
        js_code = '''
        const result = { video_hash: null, video_url: null, player: 'barlow' };

        // Method 1: Check current URL for hash
        const urlMatch = window.location.href.match(/\\/player\\/([a-f0-9]{32})/i);
        if (urlMatch) {
            result.video_hash = urlMatch[1];
            result.video_url = 'https://master.barlow-master.com/api/player/' + urlMatch[1] + '.m3u8';
        }

        // Method 2: Search in page HTML for m3u8 URL
        if (!result.video_hash) {
            const html = document.body.innerHTML || '';
            const m3u8Match = html.match(/api\\/player\\/([a-f0-9]{32})\\.m3u8/i);
            if (m3u8Match) {
                result.video_hash = m3u8Match[1];
                result.video_url = 'https://master.barlow-master.com/api/player/' + m3u8Match[1] + '.m3u8';
            }
        }

        // Method 3: Search in script tags
        if (!result.video_hash) {
            const scripts = document.querySelectorAll('script');
            for (const script of scripts) {
                const content = script.innerHTML || '';
                const hashMatch = content.match(/([a-f0-9]{32})/i);
                if (hashMatch) {
                    result.video_hash = hashMatch[1];
                    result.video_url = 'https://master.barlow-master.com/api/player/' + hashMatch[1] + '.m3u8';
                    break;
                }
            }
        }

        return JSON.stringify(result);
        '''

        result = iframe.run_js(js_code)
        return json.loads(result) if result else {}

    except Exception as e:
        print(f"Barlow iframe error: {e}")
        return {}


def collect_details(site: str, max_items: int = 0, resume: bool = True):
    """Collect detail data for a site"""

    if site not in SITES_CONFIG:
        print(f"[ERROR] Site '{site}' not configured")
        print(f"Available: {', '.join(SITES_CONFIG.keys())}")
        return 0

    config = SITES_CONFIG[site]
    site_dir = TEMP_DIR / site

    urls_file = site_dir / 'urls.jsonl'
    output_file = site_dir / 'urls_complete.jsonl'

    if not urls_file.exists():
        print(f"[{site}] urls.jsonl not found")
        return 0

    # Load records
    records = []
    with open(urls_file, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                records.append(json.loads(line))

    print(f"[{site}] Total records: {len(records)}")

    # Load already processed
    processed_ids = set()
    if resume and output_file.exists():
        with open(output_file, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    data = json.loads(line)
                    processed_ids.add(data.get('id'))
        print(f"[{site}] Already processed: {len(processed_ids)}")

    # Filter
    to_process = [r for r in records if r['id'] not in processed_ids and r.get('link')]

    if max_items > 0:
        to_process = to_process[:max_items]

    print(f"[{site}] To process: {len(to_process)}")

    if not to_process:
        print("Nothing to process!")
        return 0

    # Start browser
    print(f"\n[{site}] Starting browser on port {config['port']}...")
    browser = get_browser(config['port'])

    # Init session
    first_link = to_process[0]['link']
    base_url = '/'.join(first_link.split('/')[:3])
    browser.get(base_url)
    time.sleep(3)
    print(f"[{site}] Session ready: {browser.url}\n")

    success = 0
    no_video = 0
    failed = 0

    try:
        for i, record in enumerate(to_process, 1):
            post_id = record['id']
            link = record['link']

            print(f"  [{i}/{len(to_process)}] ID {post_id}...", end=" ", flush=True)

            try:
                browser.get(link)
                time.sleep(2)

                # Scroll to trigger lazy load
                browser.run_js('window.scrollTo(0, document.body.scrollHeight / 2);')
                time.sleep(1)

                # Extract data
                detail = extract_detail_data(browser, config)

                # Special handling for scglit: access iframe content to get video path
                if detail.get('player') == 'scglit_iframe':
                    scglit_detail = extract_scglit_from_iframe(browser)
                    if scglit_detail.get('video_hash'):
                        detail['video_hash'] = scglit_detail['video_hash']
                        detail['video_url'] = scglit_detail['video_url']
                        detail['player'] = 'scglit'

                # Special handling for barlow: access iframe content to get video hash
                if detail.get('player') == 'barlow_iframe':
                    barlow_detail = extract_barlow_from_iframe(browser)
                    if barlow_detail.get('video_hash'):
                        detail['video_hash'] = barlow_detail['video_hash']
                        detail['video_url'] = barlow_detail['video_url']
                        detail['player'] = 'barlow'

                # Build complete record
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

                # Save
                with open(output_file, 'a', encoding='utf-8') as f:
                    f.write(json.dumps(complete_record, ensure_ascii=False) + '\n')

                if detail.get('video_hash'):
                    player = detail.get('player', 'unknown')
                    print(f"OK [{player}] {detail['video_hash'][:16]}... ({len(detail.get('tags', []))} tags)")
                    success += 1
                else:
                    print(f"NO VIDEO ({len(detail.get('tags', []))} tags)")
                    no_video += 1

            except Exception as e:
                print(f"ERROR: {str(e)[:50]}")
                failed += 1

            # Rate limit
            if i % 10 == 0:
                time.sleep(1)

    except KeyboardInterrupt:
        print("\n\nInterrupted by user")

    finally:
        try:
            browser.quit()
        except:
            pass

    print()
    print("=" * 50)
    print(f"[{site}] Summary:")
    print(f"  Success (with video): {success}")
    print(f"  No video found: {no_video}")
    print(f"  Failed: {failed}")
    print(f"  Output: {output_file}")

    return success


def main():
    parser = argparse.ArgumentParser(description='Collect detail page data')
    parser.add_argument('site', help='Site name')
    parser.add_argument('-n', '--max-items', type=int, default=0, help='Max items (0=all)')
    parser.add_argument('--no-resume', action='store_true', help='Start fresh')

    args = parser.parse_args()

    print("=" * 60)
    print(f"STEP 4: COLLECT DETAILS - {args.site}")
    print("=" * 60)
    print()

    collect_details(
        site=args.site,
        max_items=args.max_items,
        resume=not args.no_resume
    )


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    main()

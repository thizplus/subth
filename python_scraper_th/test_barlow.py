# -*- coding: utf-8 -*-
"""
Test barlow-master pattern detection and download
"""
import json
import time
import sys

from DrissionPage import ChromiumPage, ChromiumOptions

# Test URL
TEST_URL = "https://xn--3-twf3dr1roa.com/%E0%B8%84%E0%B8%A5%E0%B8%B4%E0%B8%9B%E0%B8%AB%E0%B8%A5%E0%B8%B8%E0%B8%94/%e0%b8%84%e0%b8%a5%e0%b8%b4%e0%b8%9b%e0%b8%ab%e0%b8%a5%e0%b8%b8%e0%b8%94%e0%b9%84%e0%b8%a5%e0%b8%9f%e0%b9%8c%e0%b8%aa%e0%b8%94%e0%b9%81%e0%b8%ad%e0%b8%9b%e0%b8%aa%e0%b8%b5%e0%b9%80%e0%b8%ab%e0%b8%a5-7/"


def get_browser(port: int = 9250):
    options = ChromiumOptions()
    options.set_local_port(port)
    return ChromiumPage(options)


def extract_detail_data(browser) -> dict:
    """Extract video info from page"""
    js_code = r'''
    const result = {
        video_hash: null,
        video_url: null,
        player: null,
        video_iframe: null
    };

    const pageHtml = document.body.innerHTML;

    // Pattern 1: barlow hash directly in page
    const barlowHashMatch = pageHtml.match(/master\.barlow-master\.com\/(?:player|api\/player)\/([a-f0-9]{32})/i);
    if (barlowHashMatch) {
        result.video_hash = barlowHashMatch[1];
        result.player = 'barlow';
        result.video_url = 'https://master.barlow-master.com/api/player/' + barlowHashMatch[1] + '.m3u8';
        return JSON.stringify(result);
    }

    // Pattern 2: barlow iframe (major.barlow-master.com)
    const barlowIframeMatch = pageHtml.match(/major\.barlow-master\.com\/player\/([A-Za-z0-9]+)/i);
    if (barlowIframeMatch) {
        result.video_hash = barlowIframeMatch[1];
        result.player = 'barlow_iframe';
        result.video_iframe = 'https://major.barlow-master.com/player/' + barlowIframeMatch[1];
        return JSON.stringify(result);
    }

    // Pattern 3: old cyberlumina
    const cyberlumiMatch = pageHtml.match(/cyberlumina\.com\/player\/([a-f0-9\-]{36})/i);
    if (cyberlumiMatch) {
        result.video_hash = cyberlumiMatch[1];
        result.player = 'travapo';
        result.video_url = 'https://ap.travapo.com/' + cyberlumiMatch[1] + '/files/playlist.m3u8';
        return JSON.stringify(result);
    }

    return JSON.stringify(result);
    '''
    try:
        result = browser.run_js(js_code)
        return json.loads(result) if result else {}
    except Exception as e:
        print(f"JS Error: {e}")
        return {}


def extract_barlow_from_iframe(browser) -> dict:
    """Extract video hash from barlow iframe"""
    try:
        iframe = browser.ele('tag:iframe@src:barlow-master.com')
        if not iframe:
            print("  No barlow iframe found")
            return {}

        print(f"  Found iframe: {iframe.attr('src')}")

        js_code = '''
        const result = { video_hash: null, video_url: null, player: 'barlow' };

        // Check URL
        const urlMatch = window.location.href.match(/\\/player\\/([a-f0-9]{32})/i);
        if (urlMatch) {
            result.video_hash = urlMatch[1];
            result.video_url = 'https://master.barlow-master.com/api/player/' + urlMatch[1] + '.m3u8';
            return JSON.stringify(result);
        }

        // Check page HTML
        const html = document.body.innerHTML || '';
        const m3u8Match = html.match(/api\\/player\\/([a-f0-9]{32})\\.m3u8/i);
        if (m3u8Match) {
            result.video_hash = m3u8Match[1];
            result.video_url = 'https://master.barlow-master.com/api/player/' + m3u8Match[1] + '.m3u8';
            return JSON.stringify(result);
        }

        // Check for any 32-char hash
        const hashMatch = html.match(/([a-f0-9]{32})/i);
        if (hashMatch) {
            result.video_hash = hashMatch[1];
            result.video_url = 'https://master.barlow-master.com/api/player/' + hashMatch[1] + '.m3u8';
        }

        return JSON.stringify(result);
        '''

        result = iframe.run_js(js_code)
        return json.loads(result) if result else {}
    except Exception as e:
        print(f"  Iframe error: {e}")
        return {}


def test_download(video_url: str, output_file: str = "test_output.mp4"):
    """Test download with ffmpeg"""
    import subprocess

    print(f"\n[Download Test]")
    print(f"  URL: {video_url}")
    print(f"  Output: {output_file}")

    cmd = [
        'ffmpeg', '-y',
        '-headers', 'Referer: https://master.barlow-master.com/',
        '-i', video_url,
        '-c', 'copy',
        '-t', '10',  # Only download 10 seconds for test
        '-movflags', '+faststart',
        output_file
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, timeout=60)
        if result.returncode == 0:
            from pathlib import Path
            size = Path(output_file).stat().st_size / 1024
            print(f"  SUCCESS! Downloaded {size:.1f} KB")
            return True
        else:
            print(f"  FAILED!")
            print(f"  {result.stderr.decode('utf-8', errors='ignore')[-200:]}")
            return False
    except Exception as e:
        print(f"  Error: {e}")
        return False


def main():
    print("=" * 60)
    print("TEST BARLOW-MASTER DETECTION")
    print("=" * 60)
    print(f"URL: {TEST_URL}")
    print()

    browser = get_browser()

    try:
        # Step 1: Load page
        print("[1] Loading page...")
        browser.get(TEST_URL)
        time.sleep(3)
        print(f"  Title: {browser.title}")

        # Step 2: Scroll to load content
        print("\n[2] Scrolling...")
        browser.run_js('window.scrollTo(0, document.body.scrollHeight / 2);')
        time.sleep(2)

        # Step 3: Extract video info
        print("\n[3] Extracting video info...")
        detail = extract_detail_data(browser)
        print(f"  Player: {detail.get('player')}")
        print(f"  Hash: {detail.get('video_hash')}")
        print(f"  URL: {detail.get('video_url')}")
        print(f"  Iframe: {detail.get('video_iframe')}")

        # Step 4: If iframe, extract from iframe
        if detail.get('player') == 'barlow_iframe':
            print("\n[4] Extracting from iframe...")
            time.sleep(2)  # Wait for iframe to load
            barlow_detail = extract_barlow_from_iframe(browser)
            print(f"  Hash: {barlow_detail.get('video_hash')}")
            print(f"  URL: {barlow_detail.get('video_url')}")

            if barlow_detail.get('video_url'):
                detail['video_hash'] = barlow_detail['video_hash']
                detail['video_url'] = barlow_detail['video_url']
                detail['player'] = 'barlow'

        # Step 5: Test download if we have URL
        if detail.get('video_url'):
            test_download(detail['video_url'], "temp/test_barlow.mp4")
        else:
            print("\n[!] No video URL found!")

    finally:
        browser.quit()

    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    main()

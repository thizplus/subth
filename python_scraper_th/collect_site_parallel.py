# -*- coding: utf-8 -*-
"""
Parallel URL Collector - เก็บ URLs หลาย pages พร้อมกัน
Usage: python collect_site_parallel.py <site_name> --workers 4 --start-page 1 --end-page 100
"""
import sys
import json
import argparse
import time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock

# Import adapters
from sites.taknai import TaknaiAdapter
from sites.ponhub import PonhubAdapter
from sites.yeddee import YeddeeAdapter
from sites.madoohee import MadooheeAdapter
from sites.scglit import ScglitAdapter
from sites.badems import BademsAdapter
from sites.heehorm import HeehormAdapter
from sites.leahee import LeaheeAdapter

ADAPTERS = {
    'taknai': TaknaiAdapter,
    'ponhub': PonhubAdapter,
    'yeddee': YeddeeAdapter,
    'madoohee': MadooheeAdapter,
    'scglit': ScglitAdapter,
    'badems': BademsAdapter,
    'heehorm': HeehormAdapter,
    'leahee': LeaheeAdapter,
}

# Lock for file writing
file_lock = Lock()
collected_links = set()


def collect_page_range(adapter_class, temp_dir: str, start_page: int, end_page: int, worker_id: int, port_offset: int = 0):
    """
    Collect URLs from a range of pages using a single browser instance
    """
    from DrissionPage import ChromiumPage, ChromiumOptions

    results = []
    browser = None

    try:
        # Each worker uses different port
        base_port = 9230 + worker_id + port_offset
        options = ChromiumOptions()
        options.set_local_port(base_port)
        options.set_argument('--remote-debugging-port', str(base_port))
        options.set_argument('--headless')  # Run headless for speed
        browser = ChromiumPage(options)

        adapter = adapter_class(temp_dir=temp_dir)
        site_url = adapter.site_url

        print(f"[Worker {worker_id}] Starting pages {start_page}-{end_page} (port {base_port})")

        for page in range(start_page, end_page + 1):
            try:
                url = site_url if page == 1 else f"{site_url}/page/{page}/"
                browser.get(url)
                time.sleep(2)

                if "404" in browser.title:
                    print(f"[Worker {worker_id}] Page {page}: 404 - stopping")
                    break

                # Quick scroll
                browser.run_js('window.scrollTo(0, document.body.scrollHeight);')
                time.sleep(1)

                # Extract items
                js_code = r'''
                const results = [];
                const seenLinks = new Set();
                const containers = document.querySelectorAll('.col-12.badge-pos-2');
                for (let i = 0; i < containers.length; i++) {
                    const container = containers[i];
                    const itemThumb = container.querySelector('.item-thumb');
                    if (!itemThumb) continue;
                    const linkEl = itemThumb.querySelector('a[href]');
                    if (!linkEl) continue;
                    const link = linkEl.href;
                    if (seenLinks.has(link)) continue;
                    seenLinks.add(link);
                    let title = linkEl.getAttribute('title') || '';
                    if (!title) {
                        const img = itemThumb.querySelector('img[alt]');
                        if (img) title = img.alt || '';
                    }
                    if (!title) {
                        const h2 = container.querySelector('h2 a');
                        if (h2) title = h2.textContent.trim();
                    }
                    const img = itemThumb.querySelector('img');
                    const imgSrc = img ? (img.getAttribute('data-src') || img.src || '') : '';
                    results.push({index: i, link: link, title: title.substring(0,200), thumbnail: imgSrc, page: ''' + str(page) + '''});
                }
                return JSON.stringify(results);
                '''

                result = browser.run_js(js_code)
                items = json.loads(result) if result else []

                for item in items:
                    post_id = 999999 - (page * 100) - item.get('index', 0)
                    item['id'] = post_id

                results.extend(items)
                print(f"[Worker {worker_id}] Page {page}: {len(items)} items")

            except Exception as e:
                print(f"[Worker {worker_id}] Page {page} error: {e}")
                continue

    except Exception as e:
        print(f"[Worker {worker_id}] Fatal error: {e}")
    finally:
        if browser:
            try:
                browser.quit()
            except:
                pass

    return results


def merge_results(all_results: list, output_file: Path, existing_links: set):
    """
    Merge all results and write to file
    """
    new_count = 0
    with open(output_file, 'a', encoding='utf-8') as f:
        for item in all_results:
            link = item.get('link')
            if link in existing_links:
                continue
            existing_links.add(link)
            record = {
                'id': item.get('id'),
                'link': link,
                'title': item.get('title', ''),
                'thumbnail': item.get('thumbnail', '')
            }
            f.write(json.dumps(record, ensure_ascii=False) + '\n')
            new_count += 1
    return new_count


def main():
    parser = argparse.ArgumentParser(description="Parallel URL Collector")
    parser.add_argument("site", choices=ADAPTERS.keys(), help="Site name")
    parser.add_argument("--workers", type=int, default=4, help="Number of parallel workers")
    parser.add_argument("--start-page", type=int, default=1, help="Start page")
    parser.add_argument("--end-page", type=int, default=100, help="End page")
    parser.add_argument("--port-offset", type=int, default=0, help="Port offset for browser instances")

    args = parser.parse_args()

    adapter_class = ADAPTERS[args.site]
    temp_dir = "./temp"

    # Setup paths
    site_temp = Path(temp_dir) / args.site
    site_temp.mkdir(parents=True, exist_ok=True)
    urls_file = site_temp / "urls.jsonl"

    # Load existing links
    existing_links = set()
    if urls_file.exists():
        with open(urls_file, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    existing_links.add(json.loads(line).get('link'))

    print(f"Site: {args.site}")
    print(f"Workers: {args.workers}")
    print(f"Pages: {args.start_page} - {args.end_page}")
    print(f"Existing URLs: {len(existing_links)}")
    print()

    # Divide pages among workers
    total_pages = args.end_page - args.start_page + 1
    pages_per_worker = total_pages // args.workers

    page_ranges = []
    for i in range(args.workers):
        start = args.start_page + (i * pages_per_worker)
        if i == args.workers - 1:
            end = args.end_page
        else:
            end = start + pages_per_worker - 1
        page_ranges.append((start, end))

    print(f"Page ranges: {page_ranges}")
    print()

    # Run workers in parallel
    all_results = []
    start_time = time.time()

    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = {}
        for i, (start, end) in enumerate(page_ranges):
            future = executor.submit(
                collect_page_range,
                adapter_class,
                temp_dir,
                start,
                end,
                i,
                args.port_offset
            )
            futures[future] = i

        for future in as_completed(futures):
            worker_id = futures[future]
            try:
                results = future.result()
                all_results.extend(results)
                print(f"[Worker {worker_id}] Completed with {len(results)} items")
            except Exception as e:
                print(f"[Worker {worker_id}] Failed: {e}")

    # Merge results
    new_count = merge_results(all_results, urls_file, existing_links)

    elapsed = time.time() - start_time
    print()
    print(f"=" * 50)
    print(f"Completed in {elapsed:.1f}s")
    print(f"New URLs: {new_count}")
    print(f"Total URLs: {len(existing_links)}")


if __name__ == '__main__':
    main()

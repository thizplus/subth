# -*- coding: utf-8 -*-
"""
Barlow Downloader
ใช้สำหรับ barlow-master.com (taknai new player)

Pattern: HLS stream
URL: https://master.barlow-master.com/api/player/{hash}.m3u8
"""
import subprocess
from pathlib import Path


class BarlowDownloader:
    """Downloader for barlow-master.com HLS streams"""

    CDN_BASE = "https://master.barlow-master.com/api/player"

    def __init__(self, temp_dir: Path = None):
        if temp_dir is None:
            temp_dir = Path(__file__).parent.parent / 'temp' / 'barlow_download'
        self.temp_dir = temp_dir
        self.temp_dir.mkdir(parents=True, exist_ok=True)

    def download(self, video_hash: str, output_file: str, video_url: str = None) -> bool:
        """
        Download video using ffmpeg

        Args:
            video_hash: 32-char hex hash
            output_file: Output file path
            video_url: Full m3u8 URL (optional)

        Returns:
            True if download successful
        """
        print("=" * 60)
        print("DOWNLOAD barlow (FFMPEG)")
        print("=" * 60)
        print(f"Hash: {video_hash}")
        print(f"Output: {output_file}")
        print()

        # Build m3u8 URL
        if video_url:
            m3u8_url = video_url
        else:
            m3u8_url = f"{self.CDN_BASE}/{video_hash}.m3u8"

        print(f"[1] Downloading from HLS stream...")
        print(f"    URL: {m3u8_url}")

        try:
            cmd = [
                'ffmpeg',
                '-y',
                '-headers', 'Referer: https://master.barlow-master.com/',
                '-i', m3u8_url,
                '-c', 'copy',
                '-movflags', '+faststart',
                '-stats',  # Show progress
                str(output_file)
            ]

            # capture_output=False to show ffmpeg progress in real-time
            result = subprocess.run(
                cmd,
                capture_output=False,
                timeout=600  # 10 minutes timeout
            )

            output_path = Path(output_file)
            if result.returncode == 0 and output_path.exists():
                size_mb = output_path.stat().st_size / (1024 * 1024)
                print(f"\n✓ Done: {output_file} ({size_mb:.1f} MB)")
                return True
            else:
                print(f"\n✗ Failed! (code: {result.returncode})")
                return False

        except subprocess.TimeoutExpired:
            print("\n✗ Timeout (>10 minutes)")
            return False
        except Exception as e:
            print(f"\n✗ Error: {e}")
            return False


# CLI support
if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Download from barlow-master')
    parser.add_argument('hash', nargs='?', help='Video hash (32 char hex)')
    parser.add_argument('-o', '--output', default='output.mp4', help='Output file')
    args = parser.parse_args()

    downloader = BarlowDownloader()

    if args.hash:
        downloader.download(args.hash, args.output)
    else:
        # Test
        print("Testing with sample...")
        downloader.download("710868b5ed61e567ce3cffe5a2fb0296", "test_barlow.mp4")

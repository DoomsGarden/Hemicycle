"""Compression only: keep the reviewed original atlases intact."""
import concurrent.futures
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
JOBS = json.loads(Path(__file__).with_name('atlas-conversion.json').read_text())

def compress(job):
    source, target = ROOT / job['source'], ROOT / job['target']
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as atlas:
        atlas.save(target, 'WEBP', quality=87, method=4)
    return target.stat().st_size

if __name__ == '__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        size = sum(executor.map(compress, JOBS))
    print(f'{len(JOBS)} reviewed atlases compressed: {size / 1024 / 1024:.2f} MiB')

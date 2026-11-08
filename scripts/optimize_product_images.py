"""
Generate web-ready WebP versions of product images, preserving proportions.

usage:
  python scripts/optimize_product_images.py <collection-slug> <source1> [source2 ...]

For each source (any size, any aspect) it writes, into public/products/<slug>/:
  <slug>-NN-1200.webp   grid (small screens)
  <slug>-NN-2000.webp   grid (large screens)
  <slug>-NN-3200.webp   fullscreen preview
Widths are the long edge; images are only ever scaled down — never cropped.
It prints each image's dimensions for src/content/products.ts.
Originals are copied untouched into media-source/products/<slug>/.
"""
import os
import shutil
import sys

from PIL import Image

SIZES = (1200, 2000, 3200)
QUALITY = 86

slug, *sources = sys.argv[1:]
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out_dir = os.path.join(root, 'public', 'products', slug)
src_dir = os.path.join(root, 'media-source', 'products', slug)
os.makedirs(out_dir, exist_ok=True)
os.makedirs(src_dir, exist_ok=True)

for n, source in enumerate(sources, start=1):
    name = f'{slug}-{n:02d}'
    shutil.copy2(source, os.path.join(src_dir, f'{name}{os.path.splitext(source)[1]}'))
    with Image.open(source) as img:
        img = img.convert('RGB')
        w, h = img.size
        for size in SIZES:
            scale = min(1.0, size / max(w, h))
            target = (round(w * scale), round(h * scale))
            resized = img.resize(target, Image.LANCZOS) if scale < 1 else img
            path = os.path.join(out_dir, f'{name}-{size}.webp')
            resized.save(path, 'WEBP', quality=QUALITY, method=6)
            print(f'{name}-{size}.webp  {target[0]}x{target[1]}  {os.path.getsize(path) // 1024} KB')
        print(f'  -> {name}: width {w}, height {h}')

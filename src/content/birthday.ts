/**
 * ─────────────────────────────────────────────────────────────
 *  BIRTHDAY PHOTOGRAPHY — the four images on the home page.
 *
 *  Web versions live in public/products/birthday/ and were made with
 *    python scripts/optimize_product_images.py birthday <img1> … <img4>
 *  (originals copied untouched into media-source/products/birthday/).
 *  To swap an image, re-run the script and update its size below.
 * ─────────────────────────────────────────────────────────────
 */
import type { ProductImage } from './products'

const image = (n: number, title: string, alt: string, width: number, height: number): ProductImage => {
  const base = `/products/birthday/birthday-${String(n).padStart(2, '0')}`
  return {
    id: `birthday-${n}`,
    title,
    alt,
    width,
    height,
    src: { 1200: `${base}-1200.webp`, 2000: `${base}-2000.webp`, 3200: `${base}-3200.webp` },
  }
}

export const birthday = {
  eyebrow: 'Celebrations',
  title: 'Birthday Photography',
  images: [
    image(1, 'Brothers & Cake', 'Two brothers in matching yellow shirts smiling behind a cartoon-themed birthday cake', 3009, 4513),
    image(2, 'Sweet Sixteen', 'Smiling girl with red curly hair resting her arms on rose-gold 16 balloons', 1536, 2752),
    image(3, 'First Birthday', 'Family celebrating a first birthday behind a unicorn cake surrounded by pastel balloons', 6000, 4000),
    image(4, 'Cake Moment', 'Boy holding a fork and knife, eyeing a sea-themed birthday cake on a dark backdrop', 4000, 6000),
  ] satisfies ProductImage[],
} as const

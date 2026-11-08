/**
 * Shared helper for galleries of Behance projects (Reels, UGC).
 * Each entry links to its project; the thumbnail is one of the project's own
 * video poster frames, extracted by scripts/add_behance_reel.mjs.
 */
import type { GalleryImage } from '@/components/gallery/Gallery'

/**
 * Builds entries whose thumbnails live in public/<folder>/.
 * Behance video posters are 1080×1920 (9:16); pass other sizes if one differs.
 * The title is only used for alt text / screen readers — never shown.
 */
export const behanceCollection =
  (folder: string) =>
  (url: string, title: string, width = 1080, height = 1920): GalleryImage => {
    const id = /\/gallery\/(\d+)/.exec(url)?.[1] ?? url
    const base = `/${folder}/${id}`
    return {
      id: `${folder}-${id}`,
      title,
      alt: `${title} — ${folder === 'ugc' ? 'UGC' : 'reel'} thumbnail`,
      width,
      height,
      href: url,
      // Posters are 1080px wide at most, so the large size is the 1080px file.
      src: {
        1200: `${base}-1200.webp`,
        2000: `${base}-2000.webp`,
        3200: `${base}-2000.webp`,
      },
    }
  }

/**
 * ─────────────────────────────────────────────────────────────
 *  EVENT'S — shown at /events. Each card links to its Behance project.
 *
 *  Covers are each project's own Behance cover image (og:image), saved
 *  untouched in media-source/events/<project-id>/ and centre-cropped to
 *  9:16 for the cards (the same shape as Reels and UGC) in public/events/.
 *  `node scripts/add_behance_reel.mjs <url> --to events` adds more.
 *
 *  The title is only used for alt text / screen readers — never shown.
 * ─────────────────────────────────────────────────────────────
 */
import type { GalleryImage } from '@/components/gallery/Gallery'
import { behanceCollection } from '@/content/behance'

const behance = behanceCollection('events')

export const events: GalleryImage[] = [
  // @events-start
  behance('https://www.behance.net/gallery/257436667/Ayten-Birthday', 'Ayten Birthday'),
  behance('https://www.behance.net/gallery/225699445/Celia-Birthday-Photography', 'Celia Birthday Photography'),
  behance('https://www.behance.net/gallery/252977623/Birthday-Photography', 'Birthday Photography'),
  behance('https://www.behance.net/gallery/229073229/Dark-Mood-Birthday-Photography', 'Dark Mood Birthday Photography'),
  // @events-end
]

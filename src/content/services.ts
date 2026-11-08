/**
 * ─────────────────────────────────────────────────────────────
 *  SERVICES & MEDIA SLOTS
 *  Every `src` is empty on purpose: until you add your own photos
 *  and videos, each slot renders a labelled cinematic placeholder.
 *
 *  Put files in /public/media/... and reference them like:
 *    { kind: 'image', src: '/media/product/hero.webp', alt: '…' }
 *    { kind: 'video', src: '/media/reels/01.mp4', poster: '/media/reels/01.webp', alt: '…' }
 * ─────────────────────────────────────────────────────────────
 */

export interface Media {
  kind: 'image' | 'video'
  src?: string
  /** Video still shown before playback (recommended for every video). */
  poster?: string
  alt: string
  /** Shown inside the placeholder while `src` is empty. */
  label: string
}

const image = (label: string): Media => ({ kind: 'image', alt: '', label })
const video = (label: string): Media => ({ kind: 'video', alt: '', label })

export const product = {
  id: 'product',
  index: '01',
  title: 'Product Photography',
  kicker: 'Studio light',
  statement: 'Products sculpted by light — controlled reflections, precise shadows and detail you can almost touch.',
  pillars: ['Lighting', 'Composition', 'Detail', 'Retouching'],
  stage: image('Product hero shot — 16:9'),
  details: [image('Detail crop — 4:5'), image('Material close-up — 4:5'), image('Packshot — 4:5')],
}

export const reels = {
  id: 'reels',
  index: '02',
  title: 'Reels Production',
  kicker: 'Motion-first storytelling',
  statement: 'Vertical films built for the scroll — hooks in the first second, rhythm in every cut.',
  clips: [
    video('Reel 01 — 9:16'),
    video('Reel 02 — 9:16'),
    video('Reel 03 — 9:16'),
    video('Reel 04 — 9:16'),
    video('Reel 05 — 9:16'),
    video('Reel 06 — 9:16'),
  ],
}

export const ugc = {
  id: 'ugc',
  index: '03',
  title: 'UGC Creation',
  kicker: 'Authentic by design',
  statement: 'Content that feels like a recommendation from a friend — natural, native to each platform, made to convert.',
  formats: ['Testimonial', 'Unboxing', 'How-to', 'Day in the life', 'Before & after'],
  clips: [
    video('UGC clip — testimonial'),
    video('UGC clip — unboxing'),
    video('UGC clip — how-to'),
    video('UGC clip — day in the life'),
    video('UGC clip — before & after'),
  ],
}

export const events = {
  id: 'events',
  index: '04',
  title: 'Event Photography',
  kicker: 'Moments, as they were felt',
  statement: 'Atmosphere, emotion and the quiet in-between — the story of an event told frame by frame.',
  frames: [
    { media: image('Event frame — atmosphere'), caption: 'Atmosphere' },
    { media: image('Event frame — arrival'), caption: 'Arrival' },
    { media: image('Event frame — emotion'), caption: 'Emotion' },
    { media: image('Event frame — details'), caption: 'Details' },
    { media: image('Event frame — celebration'), caption: 'Celebration' },
  ],
}

export const services = [product, reels, ugc, events] as const

/**
 * ─────────────────────────────────────────────────────────────
 *  BRAND CONTENT
 *  Name, title and copy come from the brief. The four contact
 *  channels (socials) are the real ones supplied by Mahmoud. `email`,
 *  `location` and `timeZone` are still PLACEHOLDERS (not shown in the
 *  Contact section) — replace them with real ones.
 *  Logo is the official asset, used as provided. The portrait is the
 *  official photo with the T-shirt print removed (requested edit); the
 *  unedited original is kept in src/assets/brand/portrait-original.png.
 * ─────────────────────────────────────────────────────────────
 */
// Display renditions of the official assets: lossless scale-downs, same pixels
// at display size. The full-size files (logo.png, portrait-plain-shirt.webp)
// stay in src/assets/brand untouched.
import logo from '@/assets/brand/logo-512.webp'
import portrait from '@/assets/brand/portrait-plain-shirt.webp'
import portraitSmall from '@/assets/brand/portrait-plain-shirt-760.webp'

export const brand = {
  name: 'Mahmoud Taher',
  firstName: 'Mahmoud',
  lastName: 'Taher',
  role: 'Creative Visual Producer',
  introLabel: 'Visual storytelling / Creative production',
  description:
    'Transforming ideas into powerful visual experiences through photography, motion, and creative storytelling.',
  specializations: ['Product Photography', 'Reels Production', 'UGC Creation', 'Event Photography'],

  /** Official logo, 463×512 lossless (largest display is ~160px tall). */
  logo,
  /** Transparent cut-out portrait. Native pixel size, used for layout maths. */
  portrait: { src: portrait, width: 1086, height: 1448 },
  /** The same portrait at 760px wide (lossless) — the WebGL texture on phones and tablets. */
  portraitSmall: portraitSmall,

  /** Contact channels, in display order. `handle` is read off each URL. */
  socials: [
    { platform: 'instagram', label: 'Instagram', handle: '@mahmoud.taher500', href: 'https://www.instagram.com/mahmoud.taher500' },
    { platform: 'tiktok', label: 'TikTok', handle: '@mt.photography1', href: 'https://www.tiktok.com/@mt.photography1' },
    { platform: 'facebook', label: 'Facebook', handle: 'MahmoudTaherOfficial', href: 'https://www.facebook.com/MahmoudTaherOfficial' },
    { platform: 'whatsapp', label: 'WhatsApp', handle: 'Start a chat', href: 'https://wa.me/message/EXYEM2CFBICVP1' },
  ],

  // ── Placeholders: replace before launch ──────────────────────
  email: 'hello@yourdomain.com',
  location: 'City, Country',
  timeZone: 'UTC',
  availability: 'Booking new projects',
  manifesto:
    'Every frame is a decision — where the light falls, what the lens leaves out, how long a moment is allowed to breathe.',
} as const

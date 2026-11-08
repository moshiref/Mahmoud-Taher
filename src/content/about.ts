/**
 * ─────────────────────────────────────────────────────────────
 *  ABOUT — official content, supplied by Mahmoud Taher.
 *  This is the single source for the About section.
 *  Keep wording as provided; do not add achievements or claims.
 *  Rendered by src/sections/About.
 * ─────────────────────────────────────────────────────────────
 */

export const about = {
  /** Section opener. */
  intro: {
    eyebrow: 'About me',
    heading: 'Get to know the creative mind behind the lens.',
  },

  name: 'Mahmoud Taher',
  title: 'Professional Photographer & Visual Content Creator',

  /** Key highlight — to be presented as a prominent visual element. */
  experience: {
    value: 8,
    unit: 'Years',
    label: 'of experience',
    /** Full phrase, as supplied. */
    text: '8 Years of Experience',
    /** How the number is displayed in the 3D centerpiece. */
    display: '08',
    caption: 'Years of experience',
  },

  /** Official biography, one entry per paragraph. */
  biography: [
    'I am Mahmoud Taher, a professional photographer and visual content creator specializing in high-quality photography, video production, and creative visual solutions.',
    'I provide comprehensive services for brands, businesses, and individuals, combining creativity, technical expertise, and professional equipment to produce impactful visual content that highlights products, strengthens brand identity, and captures attention.',
  ],

  services: [
    'Professional Photography',
    'Product Photography',
    'Commercial & Advertising Photography',
    'Video Production & Reels',
    'UGC Content Creation',
    'Video Editing & Post-Production',
  ],

  vision: {
    heading: 'My Vision',
    text: 'My vision is to transform ideas into powerful visual experiences through creativity, precision, and attention to every detail.',
  },
} as const

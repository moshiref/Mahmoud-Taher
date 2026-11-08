/**
 * ─────────────────────────────────────────────────────────────
 *  REELS — shown at /reels. Each thumbnail links to its Behance project.
 *
 *  To add a reel, run:
 *     node scripts/add_behance_reel.mjs <behance-project-url>
 *  It opens the project, saves every video's poster frame to
 *  media-source/reels/<project-id>/, writes the web thumbnail to
 *  public/reels/ and appends the `behance(...)` line below.
 *  Prefer another frame?  Re-run with --frame <n> (see the saved posters).
 *
 *  The title is only used for alt text / screen readers — never shown.
 * ─────────────────────────────────────────────────────────────
 */
import type { GalleryImage } from '@/components/gallery/Gallery'
import { behanceCollection } from '@/content/behance'

const behance = behanceCollection('reels')

export const reels: GalleryImage[] = [
  // @reels-start
  behance('https://www.behance.net/gallery/251180423/Sushi-Restaurant', 'Sushi Restaurant'),
  behance('https://www.behance.net/gallery/255169937/Grand-Konafa', 'Grand Konafa'),
  behance('https://www.behance.net/gallery/257773151/UTS-Company-Reels', 'UTS Company Reels'),
  behance('https://www.behance.net/gallery/256055571/Car-session', 'Car session'),
  behance('https://www.behance.net/gallery/246667437/Dr-Moataz-Maher', 'Dr. Moataz Maher'),
  behance('https://www.behance.net/gallery/232802331/Reels-Dentistry', 'Reels Dentistry'),
  behance('https://www.behance.net/gallery/241446905/Snyora-Coffee-Reels', 'Snyora Coffee Reels'),
  behance('https://www.behance.net/gallery/247939069/Maui-Swimwear-Reels', 'Maui Swimwear Reels'),
  behance('https://www.behance.net/gallery/232013339/Cosmetics-photography', 'Cosmetics photography'),
  // @reels-end
]

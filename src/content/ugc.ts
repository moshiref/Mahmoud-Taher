/**
 * ─────────────────────────────────────────────────────────────
 *  UGC — shown at /ugc. Each thumbnail links to its Behance project.
 *
 *  To add a project, run:
 *     node scripts/add_behance_reel.mjs <behance-project-url> --to ugc
 *  It opens the project, saves every video's poster frame to
 *  media-source/ugc/<project-id>/, writes the web thumbnail to
 *  public/ugc/ and appends the `behance(...)` line below.
 *  Prefer another frame?  Re-run with --frame <n> (see the saved posters).
 *
 *  The title is only used for alt text / screen readers — never shown.
 * ─────────────────────────────────────────────────────────────
 */
import type { GalleryImage } from '@/components/gallery/Gallery'
import { behanceCollection } from '@/content/behance'

const behance = behanceCollection('ugc')

export const ugc: GalleryImage[] = [
  // @ugc-start
  behance('https://www.behance.net/gallery/252966289/Fashion', 'Fashion'),
  behance('https://www.behance.net/gallery/253250909/Spotrs', 'Sports'),
  behance('https://www.behance.net/gallery/252964467/Electronic-Devices', 'Electronic Devices'),
  behance('https://www.behance.net/gallery/252965915/Restaurants-and-Cafes', 'Restaurants and Cafes'),
  behance('https://www.behance.net/gallery/255682007/Food-Products', 'Food Products'),
  behance('https://www.behance.net/gallery/252965549/Perfumes', 'Perfumes'),
  behance('https://www.behance.net/gallery/252964769/Travel-and-Tourism', 'Travel and Tourism'),
  behance('https://www.behance.net/gallery/255214283/Courses', 'Courses', 720, 1280),
  behance('https://www.behance.net/gallery/254917845/Toys', 'Toys'),
  behance('https://www.behance.net/gallery/255678595/Home-Appliances', 'Home Appliances'),
  behance('https://www.behance.net/gallery/257847153/Home-Tools', 'Home Tools'),
  behance('https://www.behance.net/gallery/252965231/Servies-and-Applications', 'Services and Applications'),
  behance('https://www.behance.net/gallery/252966701/Bags', 'Bags'),
  behance('https://www.behance.net/gallery/253093581/Cosmetics', 'Cosmetics'),
  // @ugc-end
]

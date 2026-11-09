# Mahmoud Taher — Cinematic Portfolio

Creative Visual Producer: product photography, reels production, UGC creation and event photography.

**Current stage:** navigation bar, cinematic hero and About. Later stages (About, Services, Work, Contact) plug into the same scroll-driven 3D world as new camera chapters.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
npm run preview
```

## Brand rules (enforced in code)

- **Only three colours:** `#000000` (dominant), the accent `#AA9000` and `#FFFFFF` (type, minimal). The accent is the logo's primary colour: its most-used pixel colour, read directly from `logo.png`. It is one variable, `--c-accent` in `src/styles/tokens.css`, and `palette.accent` in `src/config/scene.ts` for the 3D scene.
- **The accent is never translucent, shaded, fogged or bloomed,** so it always matches the logo exactly.
  - In 3D, accent surfaces are flat (`MeshBasicMaterial`, `toneMapped: false`, `fog: false`). Depth comes from glossy black sides catching white light.
  - Accent UI reveals with clip-path wipes (`wipeIn`), never opacity fades.
  - There is no post-processing.
- **The logo and portrait are used exactly as supplied.**
  - `src/assets/brand/*-original.png` are byte-identical copies.
  - `logo.png` (a transparent-margin crop) and `portrait.webp` (lossless) were verified pixel-identical to them.
  - The portrait is drawn unlit with no colour changes. The rim light and cast shadow are separate layers derived from its alpha channel.

## Replace content

| What | Where |
| --- | --- |
| Name, title, description, specializations | `src/content/brand.ts` |
| Contact channels (Instagram, TikTok, Facebook, WhatsApp) | `src/content/brand.ts` → `socials` |
| Email (**placeholder**, used by the Let’s talk buttons) | `src/content/brand.ts` → `email` |
| Navigation items and targets | `src/config/sections.ts` |
| Hero 3D layout (portrait and slab placement) | `src/config/scene.ts` → `heroStage` |
| Camera shots per section | `src/config/scene.ts` → `chapterPoses` |
| Product collections and their images | `src/content/products.ts` |
| Reels (Behance links + thumbnails) | `src/content/reels.ts` |
| UGC (Behance links + thumbnails) | `src/content/ugc.ts` |

The About, Services, Work and Contact nav links scroll automatically once sections with those ids exist. The hero's scroll cue only appears when a section follows it.

### Adding product images

Collections live in `src/content/products.ts`. Four exist: For Menu (4 images), For Website (4), For Social Media (5) and Jewelry (4). A collection with no images shows "In preparation".

1. Run `python scripts/optimize_product_images.py <slug> <image files…>`. It needs Pillow.
   - It writes `public/products/<slug>/<slug>-NN-{1200,2000,3200}.webp`. The number is the long edge in pixels. Images are scaled down only and never cropped.
   - It copies the originals to `media-source/products/<slug>/`, which git ignores.
2. Add an `item(...)` entry per image to that collection's `items`. Give it a title, alt text and the original pixel size (the script prints it). The gallery, the lightbox and the counts update on their own.
3. Optional: `captions: false` hides the caption under each image and the title in the fullscreen viewer. Everything else stays identical. For Website, For Social Media and Jewelry use it; there the `title` is only used for screen-reader labels.

A new collection is one more object in `collections`, with its own `slug`.

### Adding a reel or UGC project

Reels live in `src/content/reels.ts` and UGC in `src/content/ugc.ts`, one `behance(url, title)` line each. Every thumbnail links to its Behance project in a new tab; nothing plays on the site. The title is only used for alt text.

Run `node scripts/add_behance_reel.mjs <behance-project-url>` for Reels, or add `--to ugc` for UGC. It needs Google Chrome and Python with Pillow.
- It opens the project in headless Chrome (Behance blocks plain HTTP clients) and saves every video's poster frame to `media-source/<reels|ugc>/<project-id>/`. Only stills are downloaded, never video files.
- It writes `public/<reels|ugc>/<project-id>-{1200,2000}.webp`, scaled down only, never cropped.
- It appends the `behance(...)` line, or updates it if the project is already listed. `--title "…"` sets the alt text (default: the Behance title).

The first video's poster is used by default. To use another, look at the posters saved in `media-source/<reels|ugc>/<project-id>/` (`poster-<n>.jpg`) and re-run with `--frame <n>`. Order on the page is the order of the lines in the data file.

## Routes

| Path | Page |
| --- | --- |
| `/` | Home: Hero, About, Work |
| `/products` | All product collections |
| `/products/<slug>` | One collection: gallery plus fullscreen viewer |
| `/reels` | Reels: 9:16 thumbnails linking to Behance |
| `/ugc` | UGC: same page as Reels |

Routing is a tiny History-API router in `src/lib/router.ts`, with no dependency. Pages swap behind a black curtain wipe. The Vite dev and preview servers already fall back to `index.html`. **Any static host needs the same rewrite** (all paths → `/index.html`), otherwise a reload on `/products/menu` returns a 404.

## How it works

- **One WebGL world** (`src/scenes`, lazy-loaded) holds the hero set. Each section is a camera chapter (`useChapterTracker` → `CameraRig`); add a pose in `config/scene.ts` per new section. The hero set is glued to the hero section in screen space, so type and photo always move together.
- **Hero** (`sections/Hero` + `scenes/hero`):
  - One GSAP timeline conducts the DOM type and the 3D reveal through `lib/heroIntro`: slab clip-plane, portrait scan-line wipe, backlight, camera push-in.
  - The preloader's logo flies into the navbar.
  - Clicking the portrait fires a shutter (flash + viewfinder frame counter).
- **Services marquee in the hero** (`scenes/hero/ServicesMarquee3D.tsx`):
  - Bevelled, extruded 3D type (accent and white alternating, at two depths) with diamond separators, on a gentle arc. One `InstancedMesh` per word.
  - It renders into the hero's DOM slot (`[data-services-slot]`), reading that box every frame. Layout stays in CSS.
  - Seamless loop: words are culled once fully off-screen, so the wrap is never visible. Hover slows it to a drift. With reduced motion it's static.
  - Font: `src/assets/fonts/geist-extrabold.typeface.json`, an A–Z subset of Geist ExtraBold (SIL OFL, licence alongside).

- **About** (`sections/About` + `scenes/about/ExperienceNumber3D.tsx`), all copy from `src/content/about.ts`:
  - A typographic editorial layout (no imagery), about 1.2 viewports tall:
    - A full-width opener.
    - The 3D extruded "08" (WebGL, drawn into the DOM slot `[data-experience-slot]`, turning with scroll) with its caption, beside the biography.
    - The six services as a compact 3 × 2 index (accent wipe on hover).
    - A closing vision row.
  - The `about` camera chapter uses the hero's pose, so the camera never moves; it only drives the navbar's active link.
- **Contact** (`sections/Contact`), the last home chapter: the heading, one line of copy, and the four channels from `brand.socials` as tiles. Each tile is a single new-tab link (`HighlightLink` with `external`) with the accent wipe on hover. Icons are the official glyphs from Simple Icons (CC0) in `components/ui/SocialIcon.tsx`, drawn in the site palette. Desktop shows four tiles in a row, tablet a 2 × 2 grid, phones full-width rows. The footer is a single centred line of plain text: "© 2026 Mahmoud Taher. All Rights Reserved."
- **Work, Products and the gallery:**
  - `sections/Work` on the home page links to `/products`, `/reels` and `/ugc`. `/products` is `pages/ProductsPage`: a centred title and the collection index. The Products pages are visually static on hover: no image preview, no row fill (`HighlightLink fill={false}`), and the collection galleries use `<Gallery still>` (no tilt, zoom or hover chip; touch still shows the chip).
  - `components/gallery/Gallery` is the one gallery, used by `pages/CollectionPage` (rows of two, opening the viewer) and `pages/BehancePage`, which renders both `/reels` and `/ugc` (rows of three, `alternate={false}`; items with an `href` become new-tab links with a centred play icon; a short last row keeps the full rows' item size, centred). It lays images out in rows. Each item's `flex-grow` is its aspect ratio, so a row shares one height and every image shows whole. Alternate rows are mirrored, and phones get a single column. Frames open with a mask reveal on scroll and lean in 3D toward the pointer.
  - `components/gallery/Lightbox` flies the image (FLIP) from its thumbnail to fullscreen and back. Previous/next are invisible full-height click zones either side of the image (the site uses no arrow icons anywhere), with wrap-around, plus arrow keys, Esc, swipe, a focus trap and scroll lock, and preloads neighbouring images. The 1200px version shows first and the full-resolution `srcset` fades in over it.

## Accessibility & performance

- **Reduced motion:** native scroll, a static scene rendered on demand, and no intro choreography.
- **Without WebGL:** a CSS rebuild of the hero set and a static services row.
- **Quality tiers:** set from device capability. Drei's `PerformanceMonitor` drops DPR under load.
- **Resource disposal:** all imperatively created geometries and materials are disposed on unmount.
- **Navigation:** skip link, keyboard-closable menu, focus styles, alpha-accurate portrait hit-testing.
- **3D renders only when needed:** the hero and About's "08" register with `lib/sceneActivity` (an IntersectionObserver). The scene runs its 60 fps loop only while one of them is on screen; elsewhere (Work, Contact, the Products / Reels / UGC pages) it renders on scroll, resize or pointer move only, and not at all while the page is still.
- **Shaders compile ahead of use:** `ShaderWarmup` (in `scenes/Experience.tsx`) renders the scene once into a 1×1 scissor box as each part mounts, so nothing compiles mid-scroll. `gl.debug.checkShaderErrors` is on in development only (it stalls every compile).
- **Reveals are built on arrival:** `Reveal` and `SplitReveal` only hide waiting content; the GSAP tween (and the text split) is created when it reaches the screen, not all at once on load.
- **Lighter images:** the site uses display renditions of the official assets, lossless scale-downs with the originals kept untouched: `logo-512.webp` (42 KB instead of the 259 KB PNG) and, for the phone/tablet WebGL texture, `portrait-plain-shirt-760.webp` (544 KB instead of 1065 KB). The portrait texture is uploaded to the GPU once.
- **Phones and tablets** (`hover: none` or under 900px): no film-grain overlay and no blur behind the scrolled header. Both were full-screen effects recomposited every frame, and barely visible on a small screen.
- **Known build quirk:** the CSS minifier keeps only `-webkit-backdrop-filter` for the header, so in Chrome the desktop header blur doesn't show in production builds (it does in dev and Safari).

## Parked from earlier iterations

`sections/Studio`, `sections/services/*`, `sections/Contact` and `content/services.ts` are not mounted. Rework or delete them when those stages are built.

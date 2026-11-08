/**
 * Add a Behance project to the Reels (or UGC) page from its URL alone.
 *
 *   node scripts/add_behance_reel.mjs <behance-project-url> [--to reels|ugc] [--frame <n>] [--title <alt text>]
 *
 * --title overrides the project title used for alt text.
 * --to picks the gallery (default reels): data in src/content/<to>.ts,
 * thumbnails in public/<to>/, sources in media-source/<to>/.
 *
 * 1. Opens the project in headless Chrome (Behance blocks plain HTTP clients).
 * 2. Finds its videos and downloads each one's poster frame (stills only —
 *    no video is ever downloaded) to media-source/<to>/<project-id>/.
 *    Projects without videos fall back to their tallest project image.
 * 3. Writes web thumbnails to public/<to>/<project-id>-{1200,2000}.webp
 *    (long edge; never upscaled, never cropped). Needs Python + Pillow, like
 *    scripts/optimize_product_images.py.
 * 4. Adds `behance(url, title)` to src/content/<to>.ts (or updates it).
 *
 * --frame <n> picks another poster (0 = the project's first video). Re-running
 * for a URL that is already listed just replaces its thumbnail.
 * Chrome is found at the usual install paths, or set CHROME=<path>.
 */
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
const url = args.find((a) => a.startsWith('http'))
const frameArg = args.indexOf('--frame')
const frame = frameArg >= 0 ? Number(args[frameArg + 1]) : 0
const toArg = args.indexOf('--to')
const to = toArg >= 0 ? args[toArg + 1] : 'reels'
const titleArg = args.indexOf('--title')
const projectId = url && /behance\.net\/gallery\/(\d+)/.exec(url)?.[1]
if (!url || !projectId || Number.isNaN(frame) || !['reels', 'ugc'].includes(to)) {
  console.error('usage: node scripts/add_behance_reel.mjs <https://www.behance.net/gallery/<id>/<name>> [--to reels|ugc] [--frame <n>]')
  process.exit(1)
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---- 1. Read the project page in headless Chrome --------------------------
const chromePath = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((p) => p && existsSync(p))
if (!chromePath) {
  console.error('Chrome not found — set CHROME=<path to chrome>')
  process.exit(1)
}

const port = 9500 + Math.floor(Math.random() * 400)
const chrome = spawn(chromePath, [
  '--headless=new',
  '--window-size=1400,1000',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${join(tmpdir(), 'behance-reel-profile')}`,
  'about:blank',
])
let page
try {
  let targets
  for (let i = 0; i < 80 && !targets; i++) {
    try {
      targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json()
    } catch {
      await sleep(250)
    }
  }
  const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl)
  await new Promise((r) => (ws.onopen = r))
  let id = 0
  const pending = new Map()
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data)
    if (!msg.id || !pending.has(msg.id)) return
    pending.get(msg.id)(msg)
    pending.delete(msg.id)
  }
  const send = (method, params = {}) =>
    new Promise((r) => {
      const i = ++id
      pending.set(i, r)
      ws.send(JSON.stringify({ id: i, method, params }))
    })
  const evaluate = async (expression) =>
    (
      await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true,
      })
    ).result?.result?.value

  await send('Network.setUserAgentOverride', { userAgent: UA })
  await send('Page.navigate', { url })
  await sleep(7000)
  for (let i = 0; i < 12; i++) {
    await evaluate('window.scrollBy(0, 900)')
    await sleep(450)
  }
  page = await evaluate(`(() => {
    // Only the project's own modules, not "more by this owner" covers.
    const own = [...document.querySelectorAll('img')]
      .filter((i) => (i.currentSrc || i.src).includes('/project_modules/') && (i.currentSrc || i.src).includes('${projectId}'))
      .map((i) => ({ src: i.currentSrc || i.src, w: i.naturalWidth, h: i.naturalHeight }))
    return {
      title: document.title.replace(/\\s*::\\s*Behance\\s*$/, '').trim(),
      videos: [...document.querySelectorAll('iframe')]
        .map((f) => (/adobe\\.io\\/v1\\/player\\/ccv\\/([^/?]+)/.exec(f.src) || [])[1])
        .filter(Boolean),
      images: own,
    }
  })()`)
  ws.close()
} finally {
  chrome.kill()
}

if (!page?.title || /not found|404/i.test(page.title)) {
  console.error(`✗ Could not open ${url} (title: "${page?.title ?? 'none'}"). Is the project public?`)
  process.exit(1)
}
console.log(`Project: ${page.title} — ${page.videos.length} video(s), ${page.images.length} image(s)`)

// ---- 2. Download the candidates -------------------------------------------
const sourceDir = join(root, 'media-source', to, projectId)
mkdirSync(sourceDir, { recursive: true })
const download = async (from, to) => {
  const res = await fetch(from, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`${res.status} ${from}`)
  writeFileSync(to, Buffer.from(await res.arrayBuffer()))
  return to
}

const candidates = []
for (const [k, video] of page.videos.entries()) {
  try {
    const embed = await (
      await fetch(`https://www-ccv.adobe.io/v1/player/ccv/${video}/embed?api_key=behance1`, { headers: { 'User-Agent': UA } })
    ).text()
    const poster = /"posterframe":\s*"([^"]+)"/.exec(embed)?.[1]
    if (!poster) throw new Error('no poster frame')
    // Indexed by video, so --frame <n> always means the n-th video even if another fails.
    candidates[k] = await download(poster, join(sourceDir, `poster-${k}.jpg`))
  } catch (e) {
    console.warn(`  video ${k}: ${e.message}`)
  }
}
if (!candidates.some(Boolean) && page.images.length) {
  // No videos: the tallest project image, at the largest size Behance serves.
  const best = [...page.images].sort((a, b) => b.h / b.w - a.h / a.w)[0]
  const large = best.src.replace(/\/project_modules\/[^/]+\//, '/project_modules/max_3840_webp/')
  candidates[0] = await download(large, join(sourceDir, 'image-0.webp')).catch(() => download(best.src, join(sourceDir, 'image-0.webp')))
}
if (!candidates.some(Boolean)) {
  console.error(`✗ ${url}: no video posters or project images could be extracted.`)
  process.exit(1)
}
console.log(`Saved ${candidates.filter(Boolean).length} of ${Math.max(candidates.length, page.videos.length)} candidate(s) to ${sourceDir}`)
const chosen = candidates[frame]
if (!chosen) {
  console.error(
    `✗ Frame ${frame} is not available (${candidates.length} candidate(s); download failures are listed above). Re-run, or pick another --frame.`,
  )
  process.exit(1)
}
console.log(`Using ${chosen}`)

// ---- 3. Web thumbnails -----------------------------------------------------
const outDir = join(root, 'public', to)
mkdirSync(outDir, { recursive: true })
const py = `
import sys
from PIL import Image
src, base = sys.argv[1], sys.argv[2]
with Image.open(src) as img:
    img = img.convert('RGB')
    w, h = img.size
    for size in (1200, 2000):
        k = min(1.0, size / max(w, h))
        out = img.resize((round(w * k), round(h * k)), Image.LANCZOS) if k < 1 else img
        out.save(f'{base}-{size}.webp', 'WEBP', quality=86, method=6)
    print(w, h)
`
const python = ['python', 'python3', 'py'].find((cmd) => spawnSync(cmd, ['--version']).status === 0)
const result =
  python &&
  spawnSync(python, ['-c', py, chosen, join(outDir, projectId)], {
    encoding: 'utf8',
  })
if (!result || result.status !== 0) {
  console.error('✗ Thumbnail optimisation failed (needs Python with Pillow):', result?.stderr ?? 'python not found')
  process.exit(1)
}
const [width, height] = result.stdout.trim().split(/\s+/).map(Number)
console.log(`Thumbnail ${width}×${height} → public/${to}/${projectId}-{1200,2000}.webp`)

// ---- 4. Register it in src/content/<to>.ts ---------------------------------
const dataPath = join(root, 'src', 'content', `${to}.ts`)
let data = readFileSync(dataPath, 'utf8')
const size = width === 1080 && height === 1920 ? '' : `, ${width}, ${height}`
const quote = (text) => `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
const title = titleArg >= 0 ? args[titleArg + 1] : page.title
const line = `  behance(${quote(url)}, ${quote(title)}${size}),`
const existing = new RegExp(`^.*behance\\('[^']*/gallery/${projectId}/.*$`, 'm')
if (existing.test(data)) {
  data = data.replace(existing, line)
  console.log(`Updated its entry in src/content/${to}.ts`)
} else {
  data = data.replace(`  // @${to}-end`, `${line}\n  // @${to}-end`)
  console.log(`Added to src/content/${to}.ts`)
}
writeFileSync(dataPath, data)
process.exit(0)

import { useCallback, useRef, useState } from 'react'
import { gsap, useGSAP } from '@/animation/gsap'
import { maskReveal, wipeIn } from '@/animation/presets'
import { Lightbox } from '@/components/gallery/Lightbox'
import { srcSet, type ProductImage } from '@/content/products'
import { useMotion } from '@/app/providers/MotionProvider'
import { isFinePointer } from '@/lib/device'
import styles from './Gallery.module.css'

/** An image, optionally linking out (e.g. a reel's Behance project) instead of opening the viewer. */
export type GalleryImage = ProductImage & { href?: string }

interface GalleryProps {
  items: GalleryImage[]
  /** Accessible name for the fullscreen viewer, e.g. the collection title. */
  label: string
  /** Re-runs the reveal/tilt setup when it changes (e.g. the collection slug). */
  resetKey: string
  /** Show a caption under each image (and its title in the viewer). */
  captions?: boolean
  /** Images per row on tablet and desktop. Rows share one height, so nothing is cropped. */
  perRow?: number
  /** Mirror every second row (editorial rhythm for mixed aspect ratios). */
  alternate?: boolean
  /** No hover effects at all: no tilt, no zoom, no "View" chip on hover. */
  still?: boolean
}

const pad = (n: number) => String(n).padStart(2, '0')

const orientation = ({ width, height }: ProductImage) => {
  const r = width / height
  return r > 1.05 ? 'Landscape' : r < 0.95 ? 'Portrait' : 'Square'
}

/** Groups images into rows of `perRow`; a short trailing row keeps what is left. */
const toRows = (items: GalleryImage[], perRow: number) => {
  const rows: GalleryImage[][] = []
  for (let i = 0; i < items.length; i += perRow) rows.push(items.slice(i, i + perRow))
  return rows
}

/**
 * The portfolio's one gallery: rows of images that share a height (each
 * item's flex-grow is its aspect ratio, so every image is shown whole),
 * shutter reveals on scroll, a gentle 3D lean toward the pointer, and either
 * the fullscreen viewer or — for items with `href` — a link out in a new tab.
 */
export function Gallery({ items, label, resetKey, captions = true, perRow = 2, alternate = true, still = false }: GalleryProps) {
  const root = useRef<HTMLDivElement>(null)
  const frames = useRef<(HTMLElement | null)[]>([])
  const [open, setOpen] = useState<number | null>(null)
  const { reducedMotion } = useMotion()
  const rows = toRows(items, perRow)

  useGSAP(
    (_, contextSafe) => {
      const el = root.current
      if (!el || reducedMotion) return

      // Scroll reveal: each frame opens like a shutter while the image settles.
      el.querySelectorAll<HTMLElement>('[data-item]').forEach((item) => {
        const frame = item.querySelector('[data-frame]')
        const img = item.querySelector('img')
        if (frame)
          maskReveal(frame, img, {
            trigger: item,
            start: 'top 90%',
            once: true,
          })
        const caption = item.querySelector('figcaption')
        if (caption)
          wipeIn(caption, {
            delay: 0.35,
            scrollTrigger: { trigger: item, start: 'top 90%', once: true },
          })
      })

      // Depth: a gentle 3D lean toward the pointer (fine pointers only; never in still mode).
      if (still || !isFinePointer() || !contextSafe) return
      const cleanups: (() => void)[] = []
      el.querySelectorAll<HTMLElement>('[data-frame]').forEach((frame) => {
        const tilt = frame.querySelector<HTMLElement>('[data-tilt]')
        if (!tilt) return
        const rx = gsap.quickTo(tilt, 'rotationX', {
          duration: 0.8,
          ease: 'power3.out',
        })
        const ry = gsap.quickTo(tilt, 'rotationY', {
          duration: 0.8,
          ease: 'power3.out',
        })
        const move = contextSafe((e: PointerEvent) => {
          const r = frame.getBoundingClientRect()
          ry(((e.clientX - r.left) / r.width - 0.5) * 7)
          rx(-((e.clientY - r.top) / r.height - 0.5) * 7)
        })
        const leave = contextSafe(() => {
          rx(0)
          ry(0)
        })
        frame.addEventListener('pointermove', move)
        frame.addEventListener('pointerleave', leave)
        cleanups.push(() => {
          frame.removeEventListener('pointermove', move)
          frame.removeEventListener('pointerleave', leave)
        })
      })
      return () => cleanups.forEach((fn) => fn())
    },
    { dependencies: [reducedMotion, resetKey, still], scope: root },
  )

  const getOrigin = useCallback((i: number) => frames.current[i] ?? null, [])
  const close = useCallback(() => setOpen(null), [])
  const sizes = (row: GalleryImage[]) =>
    row.length === 1 && perRow <= 2 ? '(max-width: 767px) 100vw, 80vw' : `(max-width: 767px) 100vw, ${Math.round(120 / perRow)}vw`

  let n = 0
  return (
    <div ref={root} className={styles.gallery} data-still={still}>
      {rows.map((row, r) => {
        // Wider grids: a short last row keeps the full rows' item size, centred.
        const partial = perRow > 2 && row.length < perRow
        return (
          <div
            key={r}
            className={styles.row}
            data-reverse={alternate && r % 2 === 1}
            data-single={!partial && row.length === 1}
            data-partial={partial}
            style={partial ? { ['--per-row' as string]: perRow } : undefined}
          >
            {row.map((image) => {
              const i = n++
              const aspect = image.width / image.height
              const ref = (el: HTMLElement | null) => {
                frames.current[i] = el
              }
              const picture = (
                <span className={styles.tilt} data-tilt>
                  <span className={styles.zoom}>
                    <img
                      src={image.src[2000]}
                      srcSet={srcSet(image)}
                      sizes={sizes(row)}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      loading={i < perRow ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  </span>
                  {image.href ? (
                    <span className={styles.play} aria-hidden="true">
                      <svg viewBox="0 0 24 24">
                        <path d="M7 4.5v15L19.5 12z" />
                      </svg>
                    </span>
                  ) : (
                    <span className={styles.view} aria-hidden="true">
                      View
                      <svg viewBox="0 0 24 24">
                        <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
                      </svg>
                    </span>
                  )}
                </span>
              )
              return (
                <figure
                  key={image.id}
                  className={styles.item}
                  data-item
                  // A lone image is sized by CSS (screen height); an inline flex-grow would override that.
                  style={{
                    flexGrow: row.length > 1 && !partial ? aspect : undefined,
                    ['--ar' as string]: aspect,
                  }}
                >
                  {image.href ? (
                    <a
                      ref={ref}
                      href={image.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.frame}
                      data-frame
                      aria-label={`${image.title} — watch on Behance (opens in a new tab)`}
                    >
                      {picture}
                    </a>
                  ) : (
                    <button
                      ref={ref}
                      type="button"
                      className={styles.frame}
                      data-frame
                      onClick={() => setOpen(i)}
                      aria-label={`View ${image.title} fullscreen`}
                    >
                      {picture}
                    </button>
                  )}
                  {captions && (
                    <figcaption className={styles.caption}>
                      <span className={styles.index}>{pad(i + 1)}</span>
                      <span className={styles.name}>{image.title}</span>
                      <span className={styles.format}>{orientation(image)}</span>
                    </figcaption>
                  )}
                </figure>
              )
            })}
          </div>
        )
      })}

      {open !== null && <Lightbox images={items} start={open} getOrigin={getOrigin} onClose={close} label={label} captions={captions} />}
    </div>
  )
}

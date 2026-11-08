import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from '@/animation/gsap'
import { useMotion } from '@/app/providers/MotionProvider'
import { srcSet, type ProductImage } from '@/content/products'
import styles from './Lightbox.module.css'

interface LightboxProps {
  images: ProductImage[]
  /** Index the viewer opens on. */
  start: number
  /** The thumbnail element for an index — the open/close flight starts and lands there. */
  getOrigin: (index: number) => HTMLElement | null
  onClose: () => void
  /** Accessible name for the dialog, e.g. the collection title. */
  label: string
  /** Show each image's title under it (off for visual-only collections). */
  captions?: boolean
}

const pad = (n: number) => String(n).padStart(2, '0')
const SIZES = '(max-width: 767px) 100vw, 88vw'

/**
 * Fullscreen image viewer. Opens with a FLIP flight from the thumbnail,
 * fits each image whole (never cropped), and supports the arrow keys / Esc / swipe, and click zones either side of the image.
 * Mount it only while open; it animates itself out before calling onClose.
 */
export function Lightbox({ images, start, getOrigin, onClose, label, captions = true }: LightboxProps) {
  const [index, setIndex] = useState(start)
  const indexRef = useRef(start)
  const root = useRef<HTMLDivElement>(null)
  const backdrop = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const busy = useRef(true) // true until the open flight lands
  const closing = useRef(false)
  const direction = useRef<0 | 1 | -1>(0)
  const swipe = useRef<{ x: number; y: number } | null>(null)
  const { lenis, reducedMotion } = useMotion()

  const total = images.length
  const image = images[index]
  indexRef.current = index

  /** Size the frame to the largest box of the image's aspect that fits the stage. */
  const fit = useCallback(() => {
    const s = stage.current
    const f = frame.current
    if (!s || !f) return
    const img = images[indexRef.current]
    const { width, height } = s.getBoundingClientRect()
    const k = Math.min(width / img.width, height / img.height)
    f.style.width = `${Math.floor(img.width * k)}px`
    f.style.height = `${Math.floor(img.height * k)}px`
  }, [images])

  /** The chrome (buttons, caption) — faded as a group. */
  const chrome = () => root.current?.querySelectorAll<HTMLElement>('[data-chrome]') ?? []

  // Open: lock scroll, fit, fly in from the thumbnail.
  useLayoutEffect(() => {
    const html = document.documentElement
    const previousFocus = document.activeElement as HTMLElement | null
    html.classList.add('is-locked')
    lenis?.stop()
    fit()
    closeBtn.current?.focus({ preventScroll: true })

    const f = frame.current!
    const origin = getOrigin(start)
    const done = () => {
      busy.current = false
      if (origin) origin.style.visibility = ''
    }

    if (reducedMotion) {
      done()
    } else {
      const from = origin?.getBoundingClientRect()
      const to = f.getBoundingClientRect()
      const tl = gsap.timeline({ onComplete: done })
      tl.fromTo(backdrop.current, { opacity: 0 }, { opacity: 1, duration: 0.55, ease: 'power2.out' }, 0)
      tl.fromTo(chrome(), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.04 }, 0.3)
      if (from && from.width > 0) {
        if (origin) origin.style.visibility = 'hidden'
        tl.fromTo(
          f,
          {
            x: from.left + from.width / 2 - (to.left + to.width / 2),
            y: from.top + from.height / 2 - (to.top + to.height / 2),
            scale: from.width / to.width,
          },
          { x: 0, y: 0, scale: 1, duration: 0.95, ease: 'expo.out' },
          0,
        )
      } else {
        tl.fromTo(f, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'power3.out' }, 0)
      }
    }

    const ro = new ResizeObserver(fit)
    if (stage.current) ro.observe(stage.current)

    return () => {
      ro.disconnect()
      html.classList.remove('is-locked')
      lenis?.start()
      if (origin) origin.style.visibility = ''
      previousFocus?.focus({ preventScroll: true })
    }
    // Runs once per mount: `start` is the opening index only.
  }, [])

  const close = useCallback(() => {
    if (closing.current) return
    closing.current = true
    const f = frame.current
    if (!f || reducedMotion) return onClose()

    gsap.killTweensOf(f)
    const target = getOrigin(indexRef.current)
    const to = target?.getBoundingClientRect()
    const from = f.getBoundingClientRect()
    const onScreen = to && to.width > 0 && to.bottom > 0 && to.top < window.innerHeight
    const tl = gsap.timeline({
      onComplete: () => {
        if (target) target.style.visibility = ''
        onClose()
      },
    })
    tl.to(chrome(), { autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, 0)
    tl.to(backdrop.current, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 0.05)
    if (onScreen) {
      // Measure without the current transform so the flight lands exactly.
      const x = gsap.getProperty(f, 'x') as number
      const y = gsap.getProperty(f, 'y') as number
      const s = gsap.getProperty(f, 'scale') as number
      const w = from.width / s
      const cx = from.left + from.width / 2 - x
      const cy = from.top + from.height / 2 - y
      tl.to(
        f,
        {
          x: to.left + to.width / 2 - cx,
          y: to.top + to.height / 2 - cy,
          scale: to.width / w,
          xPercent: 0,
          autoAlpha: 1,
          duration: 0.75,
          ease: 'expo.inOut',
          onStart: () => {
            if (target) target.style.visibility = 'hidden'
          },
        },
        0,
      )
    } else {
      tl.to(f, { autoAlpha: 0, scale: 0.94, duration: 0.45, ease: 'power2.in' }, 0)
    }
  }, [getOrigin, onClose, reducedMotion])

  const go = useCallback(
    (dir: 1 | -1) => {
      if (busy.current || closing.current || total < 2) return
      const next = (indexRef.current + dir + total) % total
      if (reducedMotion) return setIndex(next)
      busy.current = true
      direction.current = dir
      gsap.to(frame.current, {
        xPercent: -7 * dir,
        autoAlpha: 0,
        duration: 0.32,
        ease: 'power2.in',
        onComplete: () => setIndex(next),
      })
    },
    [reducedMotion, total],
  )

  // After an index change: refit, then slide the new image in.
  useLayoutEffect(() => {
    fit()
    const dir = direction.current
    if (!dir) return
    direction.current = 0
    gsap.fromTo(
      frame.current,
      { xPercent: 7 * dir, autoAlpha: 0 },
      {
        xPercent: 0,
        autoAlpha: 1,
        duration: 0.6,
        ease: 'power3.out',
        onComplete: () => {
          busy.current = false
        },
      },
    )
  }, [index, fit])

  // Preload the neighbours at the size the viewer will request.
  useEffect(() => {
    if (total < 2) return
    for (const d of [1, -1]) {
      const n = images[(index + d + total) % total]
      const img = new Image()
      img.sizes = SIZES
      img.srcset = srcSet(n)
    }
  }, [images, index, total])

  // Keyboard: Esc, arrows, and a focus trap.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        go(1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        go(-1)
      } else if (e.key === 'Tab') {
        const items = Array.from(root.current?.querySelectorAll<HTMLElement>('button:not([disabled])') ?? [])
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        const active = document.activeElement
        if (e.shiftKey && (active === first || !root.current?.contains(active))) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && (active === last || !root.current?.contains(active))) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, go])

  // Swipe (touch / pen / mouse drag) on the stage; a plain tap outside the image closes.
  const onPointerDown = (e: ReactPointerEvent) => {
    swipe.current = { x: e.clientX, y: e.clientY }
  }
  const onPointerUp = (e: ReactPointerEvent) => {
    const s = swipe.current
    swipe.current = null
    if (!s) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2) go(dx < 0 ? 1 : -1)
    else if (Math.abs(dx) < 8 && Math.abs(dy) < 8 && !frame.current?.contains(e.target as Node)) close()
  }

  return createPortal(
    <div ref={root} className={styles.root} role="dialog" aria-modal="true" aria-label={`${label} — image viewer`}>
      <div ref={backdrop} className={styles.backdrop} />

      <div className={styles.top} data-chrome>
        <span className={styles.counter} aria-live="polite">
          <span className={styles.current}>{pad(index + 1)}</span> / {pad(total)}
        </span>
        <button ref={closeBtn} type="button" className={styles.button} onClick={close} aria-label="Close viewer">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      <div ref={stage} className={styles.stage} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
        <div ref={frame} className={styles.frame}>
          {/* Cached gallery size underneath; the full-resolution version fades in over it. */}
          <img className={styles.base} src={image.src[1200]} alt="" width={image.width} height={image.height} draggable={false} />
          <img
            key={image.id}
            className={styles.full}
            srcSet={srcSet(image)}
            sizes={SIZES}
            src={image.src[2000]}
            alt={image.alt}
            width={image.width}
            height={image.height}
            draggable={false}
            onLoad={(e) => (e.currentTarget.dataset.loaded = 'true')}
          />
        </div>
      </div>

      {total > 1 && (
        <>
          <button type="button" className={`${styles.zone} ${styles.prev}`} onClick={() => go(-1)} aria-label="Previous image" data-chrome />
          <button type="button" className={`${styles.zone} ${styles.next}`} onClick={() => go(1)} aria-label="Next image" data-chrome />
        </>
      )}

      {/* Kept even when empty: it holds the mobile prev / next row together. */}
      <p className={styles.caption} data-chrome>
        {captions ? image.title : null}
      </p>
    </div>,
    document.body,
  )
}

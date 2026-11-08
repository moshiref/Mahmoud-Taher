import { useEffect, useRef, type CSSProperties } from 'react'
import type { Media } from '@/content/services'
import { useMotion } from '@/app/providers/MotionProvider'
import styles from './MediaSlot.module.css'

interface MediaSlotProps {
  media: Media
  className?: string
  /** CSS aspect-ratio, e.g. '16 / 9'. Omit to fill the parent. */
  ratio?: string
  /** Absolutely fill the nearest positioned parent. */
  fill?: boolean
  /** Load eagerly (above-the-fold imagery). */
  priority?: boolean
  /** Hide the placeholder's label and icon — for slots overlaid with their own UI. */
  compact?: boolean
}

/**
 * The single entry point for all photography and video on the site.
 *
 * - `src` set, image  → responsive <img>, lazy by default
 * - `src` set, video  → muted looping <video> that plays only while visible
 *                       (never autoplays with reduced motion)
 * - no `src`          → a labelled viewfinder placeholder, so the layout can
 *                       be art-directed before real media exists
 *
 * Children of the slot carry `data-media-content`, so motion presets can
 * scale or drift the content without touching the frame.
 */
export function MediaSlot({ media, className, ratio, fill = false, priority = false, compact = false }: MediaSlotProps) {
  const style = ratio ? ({ aspectRatio: ratio } as CSSProperties) : undefined
  const classes = [styles.slot, fill && styles.fill, className].filter(Boolean).join(' ')

  return (
    <div className={classes} style={style}>
      {media.src ? (
        media.kind === 'video' ? (
          <SlotVideo media={media} />
        ) : (
          <img
            className={styles.content}
            src={media.src}
            alt={media.alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            data-media-content
          />
        )
      ) : (
        <Placeholder media={media} compact={compact} />
      )}
    </div>
  )
}

function SlotVideo({ media }: { media: Media }) {
  const ref = useRef<HTMLVideoElement>(null)
  const { reducedMotion } = useMotion()

  useEffect(() => {
    const video = ref.current
    if (!video || reducedMotion) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => undefined)
        else video.pause()
      },
      { threshold: 0.25 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [reducedMotion])

  return (
    <video
      ref={ref}
      className={styles.content}
      src={media.src}
      poster={media.poster}
      aria-label={media.alt || undefined}
      muted
      loop
      playsInline
      preload="none"
      data-media-content
    />
  )
}

function Placeholder({ media, compact }: { media: Media; compact: boolean }) {
  return (
    <div className={styles.placeholder} data-media-content data-compact={compact} aria-hidden="true">
      <span className={styles.corner} data-pos="tl" />
      <span className={styles.corner} data-pos="tr" />
      <span className={styles.corner} data-pos="bl" />
      <span className={styles.corner} data-pos="br" />
      <span className={styles.reticle} />
      <span className={styles.kind}>{media.kind === 'video' ? <PlayIcon /> : <ApertureIcon />}</span>
      <span className={`${styles.label} t-label`}>{media.label}</span>
    </div>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M8 5.5v13l10.5-6.5z" />
    </svg>
  )
}

function ApertureIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2l4 8M22 12l-8 4M12 22l-4-8M2 12l8-4" />
    </svg>
  )
}

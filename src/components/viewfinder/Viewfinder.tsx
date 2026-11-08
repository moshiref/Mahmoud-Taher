import { useEffect, useRef } from 'react'
import { subscribeShutter } from '@/lib/shutter'
import styles from './Viewfinder.module.css'

/**
 * Camera viewfinder overlay: frame corners, a focus point, and a frame
 * counter that advances each time the visitor clicks the portrait (the
 * shutter) — the focus point confirms each shot.
 */
export function Viewfinder() {
  const focus = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let count = 1
    return subscribeShutter(() => {
      count += 1
      if (frame.current) frame.current.textContent = String(count).padStart(4, '0')
      const el = focus.current
      if (!el) return
      el.dataset.locked = 'true'
      window.setTimeout(() => (el.dataset.locked = 'false'), 450)
    })
  }, [])

  return (
    <div className={styles.viewfinder} aria-hidden="true" data-viewfinder>
      <span className={styles.corner} data-pos="tl" />
      <span className={styles.corner} data-pos="tr" />
      <span className={styles.corner} data-pos="bl" />
      <span className={styles.corner} data-pos="br" />
      <div ref={focus} className={styles.focus} data-locked="false" />
      <span className={styles.counter}>
        <i /> FRM <span ref={frame}>0001</span>
      </span>
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { gsap } from '@/animation/gsap'
import { useMotion } from '@/app/providers/MotionProvider'
import { subscribeShutter } from '@/lib/shutter'
import styles from './Flash.module.css'

/** A brief, low-intensity strobe whenever the 3D lens fires its shutter. */
export function Flash() {
  const ref = useRef<HTMLDivElement>(null)
  const { reducedMotion } = useMotion()

  useEffect(() => {
    if (reducedMotion) return
    return subscribeShutter(() => {
      gsap.fromTo(ref.current, { opacity: 0.16 }, { opacity: 0, duration: 0.6, ease: 'power2.out', overwrite: true })
    })
  }, [reducedMotion])

  return <div ref={ref} className={styles.flash} aria-hidden="true" />
}

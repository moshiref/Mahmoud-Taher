import { useRef, type ReactNode } from 'react'
import { useGSAP } from '@/animation/gsap'
import { maskReveal, REVEAL_START } from '@/animation/presets'
import { useMotion } from '@/app/providers/MotionProvider'
import styles from './MaskMedia.module.css'

interface MaskMediaProps {
  children: ReactNode
  className?: string
  start?: string
}

/** Clip-path wipe with a lens-settle scale on the media inside. */
export function MaskMedia({ children, className, start = REVEAL_START }: MaskMediaProps) {
  const frame = useRef<HTMLDivElement>(null)
  const media = useRef<HTMLDivElement>(null)
  const { reducedMotion } = useMotion()

  useGSAP(
    () => {
      if (!frame.current || reducedMotion) return
      maskReveal(frame.current, media.current, { trigger: frame.current, start, once: true })
    },
    { dependencies: [reducedMotion], scope: frame },
  )

  return (
    <div ref={frame} className={[styles.frame, className].filter(Boolean).join(' ')}>
      <div ref={media} className={styles.media}>
        {children}
      </div>
    </div>
  )
}

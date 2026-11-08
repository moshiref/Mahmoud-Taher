import { useRef, type ReactNode } from 'react'
import { useGSAP } from '@/animation/gsap'
import { parallax } from '@/animation/presets'
import { useMotion } from '@/app/providers/MotionProvider'

interface ParallaxProps {
  children: ReactNode
  /** Travel in yPercent each side of rest. Negative values move against scroll. */
  speed?: number
  className?: string
}

export function Parallax({ children, speed = 12, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { reducedMotion } = useMotion()

  useGSAP(
    () => {
      if (!ref.current || reducedMotion) return
      parallax(ref.current, speed)
    },
    { dependencies: [reducedMotion, speed], scope: ref },
  )

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  )
}

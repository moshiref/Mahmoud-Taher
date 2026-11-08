import { useRef, type ReactNode } from 'react'
import { gsap, useGSAP } from '@/animation/gsap'
import { useMotion } from '@/app/providers/MotionProvider'
import { isFinePointer } from '@/lib/device'

interface MagneticProps {
  children: ReactNode
  /** 0–1: how far the element follows the pointer. */
  strength?: number
  className?: string
}

/** Pulls its child toward the pointer while hovered, then springs back. */
export function Magnetic({ children, strength = 0.35, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { reducedMotion } = useMotion()

  useGSAP(
    (_, contextSafe) => {
      const el = ref.current
      if (!el || reducedMotion || !isFinePointer() || !contextSafe) return

      const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.4)' })
      const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.4)' })

      const onMove = contextSafe((e: PointerEvent) => {
        const r = el.getBoundingClientRect()
        xTo((e.clientX - (r.left + r.width / 2)) * strength)
        yTo((e.clientY - (r.top + r.height / 2)) * strength)
      })
      const onLeave = contextSafe(() => {
        xTo(0)
        yTo(0)
      })

      el.addEventListener('pointermove', onMove)
      el.addEventListener('pointerleave', onLeave)
      return () => {
        el.removeEventListener('pointermove', onMove)
        el.removeEventListener('pointerleave', onLeave)
      }
    },
    { dependencies: [reducedMotion, strength], scope: ref },
  )

  return (
    <div ref={ref} className={className} style={{ display: 'inline-block' }}>
      {children}
    </div>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { Reveal } from '@/components/motion/Reveal'
import { about } from '@/content/about'
import { useMotion } from '@/app/providers/MotionProvider'
import styles from './About.module.css'

type CellState = 'idle' | 'active' | 'leaving'

/** Time each service holds the highlight before it moves on. */
const STEP_MS = 1800
/** Length of the panel's exit wipe (matches the CSS transition). */
const LEAVE_MS = 600

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * The six services with an automatic "hover" that travels through them:
 * a accent panel rises behind one service, then slides up and away as the
 * next one lights. A real mouse hover takes over and pauses the cycle,
 * which resumes from there. Runs only while visible; off for reduced motion.
 */
export function ServicesIndex() {
  const { reducedMotion } = useMotion()
  const wrap = useRef<HTMLDivElement>(null)
  const count = about.services.length
  const [states, setStates] = useState<CellState[]>(() => Array(count).fill('idle'))
  const active = useRef(-1)
  const leaveTimers = useRef<number[]>([])
  const [visible, setVisible] = useState(false)
  const [paused, setPaused] = useState(false)

  const activate = useCallback(
    (index: number) => {
      const previous = active.current
      if (index === previous) return
      active.current = index
      setStates((s) => s.map((state, i) => (i === index ? 'active' : i === previous ? 'leaving' : state)))
      if (previous >= 0) {
        // Once the exit wipe has finished, park the panel below again (no transition).
        const id = window.setTimeout(() => {
          setStates((s) => s.map((state, i) => (i === previous && state === 'leaving' ? 'idle' : state)))
        }, LEAVE_MS)
        leaveTimers.current.push(id)
      }
    },
    [],
  )

  const release = useCallback(() => {
    const previous = active.current
    if (previous < 0) return
    active.current = -1
    setStates((s) => s.map((state, i) => (i === previous ? 'leaving' : state)))
    const id = window.setTimeout(() => {
      setStates((s) => s.map((state, i) => (i === previous && state === 'leaving' ? 'idle' : state)))
    }, LEAVE_MS)
    leaveTimers.current.push(id)
  }, [])

  // Only cycle while the grid is on screen.
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.35 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // The travelling highlight.
  useEffect(() => {
    if (reducedMotion || !visible || paused) return
    activate((active.current + 1) % count)
    const id = window.setInterval(() => activate((active.current + 1) % count), STEP_MS)
    return () => window.clearInterval(id)
  }, [reducedMotion, visible, paused, count, activate])

  // Off screen (or reduced motion): let the current highlight go.
  useEffect(() => {
    if (!visible || reducedMotion) release()
  }, [visible, reducedMotion, release])

  useEffect(() => () => leaveTimers.current.forEach((id) => window.clearTimeout(id)), [])

  return (
    <div ref={wrap}>
      {/* The grid reveals as soon as it enters view: About can end the page. */}
      <Reveal as="ol" stagger mode="wipe" start="top 95%" className={styles.services}>
        {about.services.map((service, i) => (
          <li
            key={service}
            className={styles.service}
            data-state={states[i]}
            onPointerEnter={(e) => {
              if (e.pointerType !== 'mouse') return
              setPaused(true)
              activate(i)
            }}
            onPointerLeave={(e) => {
              if (e.pointerType !== 'mouse') return
              setPaused(false)
            }}
          >
            <span className={styles.serviceIndex}>{pad(i + 1)}</span>
            <span className={styles.serviceName}>{service}</span>
            {/* The accent panel carries its own black copy of the label, so the wipe
                never shows a colour flip (white-on-accent or black-on-black). */}
            <span className={styles.serviceFill} aria-hidden="true">
              <span className={styles.serviceIndex}>{pad(i + 1)}</span>
              <span className={styles.serviceName}>{service}</span>
            </span>
          </li>
        ))}
      </Reveal>
    </div>
  )
}

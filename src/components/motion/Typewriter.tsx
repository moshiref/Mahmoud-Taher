import { useEffect, useRef } from 'react'
import { useIntro } from '@/app/providers/IntroProvider'
import { useMotion } from '@/app/providers/MotionProvider'
import styles from './Typewriter.module.css'

interface TypewriterProps {
  text: string
  /** Wait after the intro before the first delete, so the entrance reads complete. */
  startDelay?: number
}

/** Timing in ms; each keystroke gets a little human variance. */
const TIMING = {
  type: [55, 95],
  erase: [28, 42],
  /** Extra beat after a space or slash while typing, like a real typist. */
  wordGap: 110,
  holdFull: 1900,
  holdEmpty: 650,
}

const between = ([min, max]: number[]) => min + Math.random() * (max - min)

/**
 * Types a line out, holds, deletes it, holds, and repeats — forever.
 *
 * An invisible copy of the full text reserves the box, and the typed text is
 * drawn in that same box on top, so width, height and line wrapping never
 * shift. Characters are written straight into the DOM (no re-render per
 * keystroke). Screen readers get the full sentence; reduced motion shows the
 * text statically.
 */
export function Typewriter({ text, startDelay = 1800 }: TypewriterProps) {
  const out = useRef<HTMLSpanElement>(null)
  const root = useRef<HTMLSpanElement>(null)
  const { reducedMotion } = useMotion()
  const { introDone } = useIntro()

  useEffect(() => {
    const el = out.current
    const host = root.current
    if (!el || !host) return
    el.textContent = text
    if (reducedMotion || !introDone) return

    let timer = 0
    let length = text.length
    const chars = Array.from(text) // code-point safe

    const render = () => (el.textContent = chars.slice(0, length).join(''))
    const setTyping = (typing: boolean) => (host.dataset.typing = String(typing))

    const erase = () => {
      setTyping(true)
      if (length === 0) {
        setTyping(false)
        timer = window.setTimeout(type, TIMING.holdEmpty)
        return
      }
      length -= 1
      render()
      timer = window.setTimeout(erase, between(TIMING.erase))
    }

    const type = () => {
      setTyping(true)
      if (length === chars.length) {
        setTyping(false)
        timer = window.setTimeout(erase, TIMING.holdFull)
        return
      }
      length += 1
      render()
      const typed = chars[length - 1]
      const beat = typed === ' ' || typed === '/' ? TIMING.wordGap : 0
      timer = window.setTimeout(type, between(TIMING.type) + beat)
    }

    timer = window.setTimeout(erase, startDelay)
    return () => {
      window.clearTimeout(timer)
      el.textContent = text
      setTyping(false)
    }
  }, [text, startDelay, reducedMotion, introDone])

  return (
    <span ref={root} className={styles.typewriter} data-typing="false">
      <span className="sr-only">{text}</span>
      {/* Reserves the full text's box so nothing around it ever moves. */}
      <span className={styles.ghost} aria-hidden="true">
        {text}
      </span>
      <span className={styles.live} aria-hidden="true">
        <span ref={out}>{text}</span>
        {!reducedMotion && <i className={styles.caret} />}
      </span>
    </span>
  )
}

/**
 * A tiny mutable store shared by the DOM and the WebGL scene.
 *
 * The render loop reads these values every frame, so they live outside React
 * state on purpose: writing them never triggers a re-render. Components that
 * do need to re-render (e.g. the chapter HUD) subscribe to discrete changes.
 */

type Listener = () => void

export const scrollState = {
  /** Scroll offset in px. */
  y: 0,
  /** 0–1 progress through the whole page. */
  progress: 0,
  /** Lenis velocity (px per frame); 0 with native scrolling. */
  velocity: 0,
  direction: 1 as 1 | -1,
  /** Continuous chapter position: 1.5 = halfway between chapters 1 and 2. */
  chapter: 0,
  /** Pointer in normalised device coordinates (-1 → 1). */
  pointer: { x: 0, y: 0 },
}

let activeChapter = 0
const chapterListeners = new Set<Listener>()

export function setChapterPosition(t: number) {
  scrollState.chapter = t
  const index = Math.round(t)
  if (index !== activeChapter) {
    activeChapter = index
    chapterListeners.forEach((listener) => listener())
  }
}

export function subscribeChapter(listener: Listener) {
  chapterListeners.add(listener)
  return () => {
    chapterListeners.delete(listener)
  }
}

export const getActiveChapter = () => activeChapter

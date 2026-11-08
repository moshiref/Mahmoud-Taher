import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useMotion } from './MotionProvider'

interface IntroContextValue {
  /** True once the preloader has fully exited — hero entrances key off this. */
  introDone: boolean
  /** True once the WebGL scene has rendered its first frame (or was skipped). */
  sceneReady: boolean
  completeIntro: () => void
  markSceneReady: () => void
}

const IntroContext = createContext<IntroContextValue | null>(null)

/** Coordinates the preloader, the lazy 3D scene and the first-screen choreography. */
export function IntroProvider({ children }: { children: ReactNode }) {
  const { lenis } = useMotion()
  const [introDone, setIntroDone] = useState(false)
  const [sceneReady, setSceneReady] = useState(false)

  // Lock scrolling while the preloader is on screen.
  useEffect(() => {
    document.documentElement.classList.toggle('is-locked', !introDone)
    if (!lenis) return
    if (introDone) lenis.start()
    else lenis.stop()
  }, [introDone, lenis])

  const completeIntro = useCallback(() => setIntroDone(true), [])
  const markSceneReady = useCallback(() => setSceneReady(true), [])

  const value = useMemo(
    () => ({ introDone, sceneReady, completeIntro, markSceneReady }),
    [introDone, sceneReady, completeIntro, markSceneReady],
  )

  return <IntroContext.Provider value={value}>{children}</IntroContext.Provider>
}

export function useIntro() {
  const ctx = useContext(IntroContext)
  if (!ctx) throw new Error('useIntro must be used inside <IntroProvider>')
  return ctx
}

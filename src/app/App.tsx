import { useEffect } from 'react'
import { ScrollTrigger } from '@/animation/gsap'
import { Flash } from '@/components/layout/Flash'
import { Grain } from '@/components/layout/Grain'
import { Header } from '@/components/layout/Header'
import { Preloader } from '@/components/layout/Preloader'
import { SceneLayer } from '@/components/layout/SceneLayer'
import { PageRouter } from '@/components/layout/PageRouter'
import { IntroProvider, useIntro } from './providers/IntroProvider'
import { MotionProvider } from './providers/MotionProvider'

export function App() {
  return (
    <MotionProvider>
      <IntroProvider>
        <Shell />
      </IntroProvider>
    </MotionProvider>
  )
}

function Shell() {
  const { introDone } = useIntro()

  // Layout settles after web fonts load and after the scroll lock lifts;
  // re-measure every trigger at both moments.
  useEffect(() => {
    document.fonts.ready.then(() => ScrollTrigger.refresh())
  }, [])
  useEffect(() => {
    if (introDone) ScrollTrigger.refresh()
  }, [introDone])

  return (
    <>
      <Preloader />
      <SceneLayer />
      <Header />
      <PageRouter />
      <Flash />
      <Grain />
    </>
  )
}

import { lazy, Suspense, useEffect, useState } from 'react'
import { useIntro } from '@/app/providers/IntroProvider'
import { useMotion } from '@/app/providers/MotionProvider'
import { brand } from '@/content/brand'
import { getDeviceTier, hasWebGL } from '@/lib/device'
import styles from './SceneLayer.module.css'

// three.js, R3F and drei live in their own chunk, fetched in parallel with the intro.
const Experience = lazy(() => import('@/scenes/Experience'))

export function SceneLayer() {
  const { reducedMotion } = useMotion()
  const { sceneReady, markSceneReady } = useIntro()
  const [tier] = useState(getDeviceTier)
  const [webgl] = useState(hasWebGL)

  useEffect(() => {
    if (!webgl) markSceneReady()
  }, [webgl, markSceneReady])

  return (
    <div className={styles.layer} data-ready={sceneReady} aria-hidden="true">
      {webgl ? (
        <Suspense fallback={null}>
          <Experience tier={tier} reduced={reducedMotion} onReady={markSceneReady} />
        </Suspense>
      ) : (
        // Without WebGL the set is rebuilt in CSS around the same portrait asset.
        <div className={styles.fallback}>
          <div className={styles.slab} />
          <img className={styles.portrait} src={brand.portrait.src} alt="" decoding="async" />
        </div>
      )}
    </div>
  )
}

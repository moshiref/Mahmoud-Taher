import { Environment, Lightformer } from '@react-three/drei'
import { palette } from '@/config/scene'

/**
 * Studio lighting from procedural light formers — white softboxes and strips
 * only. Brand accent appears exclusively as flat emissive surfaces: accent
 * light reflected off black falls off into olive/gold, which the brand rules
 * out. The environment is baked once (frames={1}); no HDR download.
 */
export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <directionalLight position={[4, 6, 5]} intensity={1.1} color={palette.white} />

      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.6} color={palette.white} position={[0, 5, -4]} scale={[12, 2.5, 1]} />
        <Lightformer form="rect" intensity={0.8} color={palette.white} position={[0, -4, 3]} rotation-x={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={2.2} color={palette.white} position={[-6, 0.5, 1]} rotation-y={Math.PI / 2} scale={[8, 0.2, 1]} />
        <Lightformer form="rect" intensity={2.2} color={palette.white} position={[6, -0.5, 1]} rotation-y={-Math.PI / 2} scale={[8, 0.2, 1]} />
      </Environment>
    </>
  )
}

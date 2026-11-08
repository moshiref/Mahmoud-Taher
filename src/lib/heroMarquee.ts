/**
 * Bridge between the hero's DOM slot for the services marquee and the 3D
 * strip that renders inside it. The DOM owns layout and hover; the scene
 * reads the slot's on-screen rectangle every frame and draws into it.
 */
export const heroMarquee = {
  /** The element whose box the 3D strip occupies (set by the Hero). */
  slot: null as HTMLElement | null,
  /** True while the pointer is over the strip — it slows to a drift. */
  hovered: false,
}

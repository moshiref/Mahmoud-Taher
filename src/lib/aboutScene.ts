/**
 * Bridge between the About section's DOM and its 3D "08" centerpiece.
 * The DOM owns layout and choreography; the scene draws into `slot`.
 */
export const aboutScene = {
  /** Element whose box the 3D number occupies (set by the About section). */
  slot: null as HTMLElement | null,
  /** 0 → 1 entrance of the number (tweened by GSAP when the stage enters). */
  reveal: 0,
}

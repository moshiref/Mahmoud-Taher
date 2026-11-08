/**
 * Section ids double as 3D "chapters": the camera moves between a pose per
 * chapter as you scroll (see config/scene.ts and scenes/rig).
 * Order here must match the order of `[data-chapter]` sections on the page.
 */
export const chapters = ['hero', 'about', 'work', 'contact'] as const
export type ChapterId = (typeof chapters)[number]

/**
 * Primary navigation. `target` is the id of the section a link scrolls to.
 * `hero`, `about`, `work` and `contact` exist; the other links activate
 * automatically once sections with those ids ship.
 */
export const navItems = [
  { label: 'Home', target: 'hero' },
  { label: 'About', target: 'about' },
  { label: 'Services', target: 'services' },
  { label: 'Work', target: 'work' },
  { label: 'Contact', target: 'contact' },
] as const

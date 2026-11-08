import styles from './Grain.module.css'

/** Film grain as a CSS overlay — cheaper than a post-processing pass. */
export function Grain() {
  return <div className={styles.grain} aria-hidden="true" />
}

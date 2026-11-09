import { Reveal } from '@/components/motion/Reveal'
import { SplitReveal } from '@/components/motion/SplitReveal'
import { HighlightLink } from '@/components/ui/HighlightLink'
import { SocialIcon } from '@/components/ui/SocialIcon'
import { brand } from '@/content/brand'
import styles from './Contact.module.css'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Contact — the closing chapter: a large two-line heading, one line of
 * copy, and the four real channels as tiles. Each tile is one link to the
 * platform (new tab) and takes the site's solid-accent wipe on hover.
 */
export function Contact() {
  return (
    <section id="contact" data-chapter className={styles.contact} aria-labelledby="contact-title">
      <header className={styles.head}>
        <Reveal mode="wipe">
          <span className="eyebrow">Contact</span>
        </Reveal>
        <h2 id="contact-title" className={styles.title}>
          <SplitReveal as="span" type="chars" className={styles.line}>
            Let’s work
          </SplitReveal>{' '}
          <SplitReveal as="span" type="chars" delay={0.12} className={`${styles.line} ${styles.accent}`}>
            together
          </SplitReveal>
        </h2>
        <Reveal mode="wipe" delay={0.25}>
          <p className={styles.subtitle}>Have a project in mind? Let’s create something extraordinary.</p>
        </Reveal>
      </header>

      <Reveal as="ul" stagger mode="wipe" start="top 92%" className={styles.channels}>
        {brand.socials.map((s, i) => (
          <li key={s.platform}>
            <HighlightLink
              to={s.href}
              external
              className={styles.channel}
              contentClassName={styles.channelBody}
              label={`${s.label} — ${s.handle} (opens in a new tab)`}
            >
              <span className={styles.top}>
                <span className={styles.icon}>
                  <SocialIcon platform={s.platform} />
                </span>
                <span className={styles.index}>{pad(i + 1)}</span>
              </span>
              <span className={styles.bottom}>
                <span className={styles.text}>
                  <span className={styles.name}>{s.label}</span>
                  <span className={styles.handle}>{s.handle}</span>
                </span>
              </span>
            </HighlightLink>
          </li>
        ))}
      </Reveal>

      <Reveal as="footer" mode="wipe" start="top 99%" className={styles.footer}>
        <p className={styles.signature}>© 2026 Mahmoud Taher. All Rights Reserved.</p>
      </Reveal>
    </section>
  )
}

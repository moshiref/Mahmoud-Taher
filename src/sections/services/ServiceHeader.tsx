import { Reveal } from '@/components/motion/Reveal'
import { SplitReveal } from '@/components/motion/SplitReveal'
import styles from './ServiceHeader.module.css'

interface ServiceHeaderProps {
  service: { id: string; index: string; title: string; kicker: string; statement: string }
  className?: string
}

/** Shared title block so the four services keep one typographic voice. */
export function ServiceHeader({ service, className }: ServiceHeaderProps) {
  return (
    <header className={[styles.header, className].filter(Boolean).join(' ')}>
      <div className={styles.kicker}>
        <span className={styles.index}>{service.index}</span>
        <span className="eyebrow">{service.kicker}</span>
      </div>
      <SplitReveal as="h2" id={`${service.id}-title`} type="chars" className={`${styles.title} t-display`}>
        {service.title}
      </SplitReveal>
      <Reveal>
        <p className={styles.statement}>{service.statement}</p>
      </Reveal>
    </header>
  )
}

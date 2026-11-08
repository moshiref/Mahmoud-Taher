import type { MouseEventHandler, ReactNode } from 'react'
import styles from './Button.module.css'

interface ButtonProps {
  children: ReactNode
  href?: string
  onClick?: MouseEventHandler<HTMLElement>
  variant?: 'primary' | 'ghost'
  size?: 'md' | 'sm'
  className?: string
  tabIndex?: number
}

/**
 * Brand call-to-action. Primary: accent fill whose black "ink" wipes up on
 * hover, turning the label accent. Ghost: hairline outline that turns accent.
 * Both states stay within black / accent / white — never a blended tone.
 */
export function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  tabIndex,
}: ButtonProps) {
  const classes = [styles.button, className].filter(Boolean).join(' ')
  const content = <span className={styles.label}>{children}</span>
  const shared = { className: classes, 'data-variant': variant, 'data-size': size, onClick, tabIndex }

  return href ? (
    <a href={href} {...shared}>
      {content}
    </a>
  ) : (
    <button type="button" {...shared}>
      {content}
    </button>
  )
}

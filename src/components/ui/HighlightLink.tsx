import type { ReactNode } from 'react'
import { RouteLink } from '@/components/navigation/RouteLink'
import styles from './HighlightLink.module.css'

interface HighlightLinkProps {
  /** In-app route, or an external URL when `external` is set (opens in a new tab). */
  to: string
  external?: boolean
  /** The accent wipe on hover/focus. Off = a plain, visually static link. */
  fill?: boolean
  children: ReactNode
  /** Layout for the content (applied identically to the accent copy). */
  contentClassName?: string
  className?: string
  onPointerEnter?: () => void
  onPointerLeave?: () => void
  label?: string
}

/**
 * A full-width editorial link. On hover/focus a solid accent panel wipes up
 * from the baseline carrying a black copy of the content, so the wipe never
 * passes through a colour flip. Children are rendered twice for that reason.
 */
export function HighlightLink({
  to,
  external,
  fill = true,
  children,
  contentClassName,
  className,
  onPointerEnter,
  onPointerLeave,
  label,
}: HighlightLinkProps) {
  const props = {
    className: [styles.link, className].filter(Boolean).join(' '),
    onPointerEnter,
    onPointerLeave,
    'aria-label': label,
  }
  const content = (
    <>
      <span className={[styles.content, contentClassName].filter(Boolean).join(' ')}>{children}</span>
      {fill && (
        <span className={[styles.content, styles.fill, contentClassName].filter(Boolean).join(' ')} aria-hidden="true">
          {children}
        </span>
      )}
    </>
  )
  return external ? (
    <a href={to} target="_blank" rel="noopener noreferrer" {...props}>
      {content}
    </a>
  ) : (
    <RouteLink to={to} {...props}>
      {content}
    </RouteLink>
  )
}

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { navigate } from '@/lib/router'

interface RouteLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string
  children: ReactNode
}

/**
 * A real link (works with middle-click / open-in-new-tab) that navigates
 * in-app for a plain left click.
 */
export function RouteLink({ to, children, onClick, ...rest }: RouteLinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    navigate(to)
  }
  return (
    <a href={to} onClick={handle} {...rest}>
      {children}
    </a>
  )
}

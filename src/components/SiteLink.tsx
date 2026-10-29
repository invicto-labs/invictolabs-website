import type { AnchorHTMLAttributes } from 'react'
import { Link, useLocation } from 'react-router-dom'

// Keep downloads, external sites, email and telephone links native.
export function SiteLink({ href = '', ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const location = useLocation()
  const internal = href.startsWith('#') || (href.startsWith('/') && !href.startsWith('//'))
  const asset = /\.[a-z0-9]+(?:[?#]|$)/i.test(href)
  if (!internal || asset || props.download || props.target === '_blank') return <a href={href} {...props} />
  const [destination, section = ''] = href.split('#')
  const to = destination || `${location.pathname}${location.search}`
  return <Link to={to} state={{ scrollTarget: section }} {...props} />
}

import Link from 'next/link'

interface Crumb { label: string; href?: string }
interface Props { crumbs: Crumb[] }

export function Breadcrumb({ crumbs }: Props) {
  return (
    <nav className="flex items-center gap-2 text-xs text-brown-light mb-6">
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span>/</span>}
          {c.href ? (
            <Link href={c.href} className="hover:text-brown transition-colors">{c.label}</Link>
          ) : (
            <span className="text-brown">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

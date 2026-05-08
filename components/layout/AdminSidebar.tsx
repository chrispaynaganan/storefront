'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/collections', label: 'Collections' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/promos', label: 'Promos' },
  { href: '/admin/users', label: 'Customers' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-56 min-h-screen bg-brown text-white flex-shrink-0">
      <div className="p-6 border-b border-brown-light">
        <p className="text-sm font-medium text-peach">Admin</p>
      </div>
      <nav className="p-4 space-y-1">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'block px-4 py-2 rounded-lg text-sm transition-colors',
              pathname === link.href
                ? 'bg-peach text-brown font-medium'
                : 'text-peach-light hover:bg-brown-light'
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

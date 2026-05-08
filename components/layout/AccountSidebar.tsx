'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/account', label: 'Profile' },
  { href: '/account/orders', label: 'Orders' },
  { href: '/account/addresses', label: 'Addresses' },
]

export function AccountSidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-48 flex-shrink-0">
      <nav className="space-y-1">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'block px-4 py-2 rounded-lg text-sm transition-colors',
              pathname === link.href
                ? 'bg-[#FFCBA4] text-[#3B1F0E] font-medium'
                : 'text-[#6B3A22] hover:text-[#3B1F0E] hover:bg-[#FFE8D6]'
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
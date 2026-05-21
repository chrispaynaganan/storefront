'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingBag,
  Tag,
  Users,
  BookOpen,
  Images,
  FileText,
  ScrollText,
  LogOut,
} from 'lucide-react'

// Role hierarchy:
// staff   — orders, journal, lookbook only (day-to-day ops)
// manager — everything except pages and logs (adminOnly items)
// admin   — full access, can also manage user roles

type Role = 'admin' | 'manager' | 'staff'

interface NavItem {
  href: string
  label: string
  icon: any
  exact?: boolean
  // Which roles can see this item. Omit = all allowed roles can see it.
  roles?: Role[]
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin',             label: 'Dashboard',   icon: LayoutDashboard, exact: true },
  { href: '/admin/products',    label: 'Products',    icon: Package,         roles: ['admin', 'manager'] },
  { href: '/admin/collections', label: 'Collections', icon: FolderOpen,      roles: ['admin', 'manager'] },
  { href: '/admin/orders',      label: 'Orders',      icon: ShoppingBag },
  { href: '/admin/promos',      label: 'Promos',      icon: Tag,             roles: ['admin', 'manager'] },
  { href: '/admin/users',       label: 'Customers',   icon: Users,           roles: ['admin', 'manager'] },
  { href: '/admin/journal',     label: 'Journal',     icon: BookOpen },
  { href: '/admin/lookbook',    label: 'Lookbook',    icon: Images },
  { href: '/admin/pages',       label: 'Pages',       icon: FileText,        roles: ['admin'] },
  { href: '/admin/logs',        label: 'Logs',        icon: ScrollText,      roles: ['admin'] },
]

const ROLE_LABELS: Record<Role, string> = {
  admin:   'Admin',
  manager: 'Manager',
  staff:   'Staff',
}

const ROLE_COLORS: Record<Role, string> = {
  admin:   'text-peach/70',
  manager: 'text-amber-400/70',
  staff:   'text-sky-400/70',
}

export interface AdminSidebarProps {
  userEmail?: string
  avatarUrl?: string
  firstName?: string
  userRole?: string
}

export function AdminSidebar({ userEmail, avatarUrl, firstName, userRole }: AdminSidebarProps) {
  const pathname = usePathname()
  const role = (userRole ?? 'staff') as Role

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  const visibleItems = NAV_ITEMS.filter(
    item => !item.roles || item.roles.includes(role)
  )

  const initials = firstName?.[0]?.toUpperCase() ?? userEmail?.[0]?.toUpperCase() ?? 'A'

  return (
    <aside className="fixed top-0 left-0 h-screen w-55 bg-brown flex flex-col z-40">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <span className="text-whitewash font-semibold text-base tracking-tight">
          Known & Worn
        </span>
        <span className="block text-peach/60 text-xs mt-0.5">Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map(item => {
          const Icon = item.icon
          const active = isActive(item.href, item.exact)
          const isAdminOnly = item.roles?.length === 1 && item.roles[0] === 'admin'
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-white/10 text-whitewash font-medium'
                  : 'text-whitewash/70 hover:bg-white/10 hover:text-whitewash'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isAdminOnly && role === 'admin' && (
                <span className="text-[10px] text-peach/50 font-medium uppercase tracking-wide">
                  Admin
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User + sign out */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={firstName} className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-peach/20 flex items-center justify-center text-xs font-medium text-peach">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm text-whitewash font-medium truncate">{firstName}</p>
            <p className={clsx('text-xs font-medium truncate', ROLE_COLORS[role] ?? 'text-whitewash/40')}>
              {ROLE_LABELS[role] ?? role}
            </p>
          </div>
        </div>

        <Link
          href="/admin/signout"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-whitewash/60 hover:bg-white/10 hover:text-whitewash transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Link>
      </div>
    </aside>
  )
}
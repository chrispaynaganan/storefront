'use client'

// components/layout/AdminSidebar.tsx

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'Products',
    href: '/admin/products',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    label: 'Collections',
    href: '/admin/collections',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    label: 'Promos',
    href: '/admin/promos',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    label: 'Customers',
    href: '/admin/users',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'Journal',
    href: '/admin/journal',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    label: 'Logs',
    href: '/admin/logs',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
]

function useIsActive() {
  const pathname = usePathname()
  return (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
}

// ─── Desktop sidebar (lg+) ────────────────────────────────────────────────────

function AdminSidebar({
  userEmail,
  avatarUrl,
  firstName,
  userRole,
}: {
  userEmail?: string | null
  avatarUrl?: string | null
  firstName?: string | null
  userRole?: string | null
}) {
  const isActive = useIsActive()

  return (
    <aside
      className="hidden lg:flex flex-col w-70 shrink-0 fixed top-0 left-0 bg-peach-light/60 rounded-3xl m-4 p-5"
      style={{ height: 'calc(100vh - 2rem)' }}
    >
      {/* Brand */}
      <div className="mb-8 px-1">
        <p className="text-sm font-extrabold tracking-widest text-brown uppercase leading-none">
          Known&amp;Worn
        </p>
        <p className="text-xs text-brown/40 mt-1">
          {firstName ?? 'Admin'}{' '}
          <span className="text-brown/20">·</span>{' '}
          <span className="capitalize">{userRole ?? 'admin'}</span>
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1">
        {NAV.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors',
                active ? 'bg-peach/50 text-brown' : 'text-brown/50 hover:bg-peach/20 hover:text-brown',
              )}
            >
              <span className={cn('shrink-0', active ? 'text-brown' : 'text-brown/40')}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <Link
        href="/admin/signout"
        className="flex items-center gap-3 px-2 py-2 mt-4 rounded-xl hover:bg-peach/20 transition-colors group w-full"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-peach flex items-center justify-center text-brown text-xs font-bold shrink-0">
            {userEmail?.[0]?.toUpperCase() ?? 'A'}
          </div>
        )}
        <span className="text-sm font-semibold text-brown/50 group-hover:text-brown transition-colors">
          Sign Out
        </span>
      </Link>
    </aside>
  )
}

// ─── Mobile + tablet bottom tab bar (below lg) ───────────────────────────────

function AdminTabBar({
  firstName,
  userRole,
}: {
  firstName?: string | null
  userRole?: string | null
}) {
  const isActive = useIsActive()

  return (
    <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-whitewash/95 backdrop-blur-md border border-whitewash-off rounded-3xl shadow-lg px-2 py-2">
        <div className="flex items-center justify-around">
          {NAV.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 py-1 px-1 flex-1 min-w-0"
              >
                <span
                  className={cn(
                    'flex items-center justify-center w-9 h-9 rounded-xl transition-colors',
                    active ? 'bg-peach/50 text-brown' : 'text-brown/35',
                  )}
                >
                  {item.icon}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-semibold truncate w-full text-center leading-none',
                    active ? 'text-brown' : 'text-brown/35',
                  )}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

// ─── Default export ───────────────────────────────────────────────────────────

export default function AdminNav({
  userEmail,
  avatarUrl,
  firstName,
  userRole,
}: {
  userEmail?: string | null
  avatarUrl?: string | null
  firstName?: string | null
  userRole?: string | null
}) {
  return (
    <>
      <AdminSidebar userEmail={userEmail} avatarUrl={avatarUrl} firstName={firstName} userRole={userRole} />
      <AdminTabBar firstName={firstName} userRole={userRole} />
    </>
  )
}
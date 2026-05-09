'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@/types'

const NAV_LINKS = [
  { label: 'Women',   href: '/' },
  { label: 'Men',     href: '/' },
  { label: 'Kids',    href: '/' },
  { label: 'Hoodies', href: '/collections/hoodies' },
  { label: 'Shirts',  href: '/collections/shirts' },
  { label: 'New',     href: '/' },
  { label: 'Sports',  href: '/' },
  { label: 'Sale',    href: '/collections/sale', sale: true },
]

interface Props { user: User | null }

export function MobileMenu({ user }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    setOpen(false)
    if (trimmed) {
      router.push(`/products?q=${encodeURIComponent(trimmed)}`)
    } else {
      router.push('/products')
    }
  }

  return (
    <div className="sm:hidden">
      {/* Hamburger */}
      <button onClick={() => setOpen(!open)}
        className="p-1.5 text-brown" aria-label="Toggle menu" aria-expanded={open}>
        {open ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setOpen(false)} />
          <div className="fixed top-14 left-0 right-0 bottom-0 z-50 bg-whitewash overflow-y-auto">

            {/* Search */}
            <div className="px-4 pt-4 pb-3 border-b border-peach-light">
              <form onSubmit={handleSearch} className="relative flex items-center">
                <svg className="absolute left-3 w-4 h-4 text-brown-light shrink-0 pointer-events-none"
                  fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z" />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search products..."
                  autoFocus
                  className="w-full bg-whitewash-off rounded-full h-10 pl-9 pr-4 text-[14px] text-brown placeholder:text-brown-light/60 focus:outline-none focus:ring-2 focus:ring-peach"
                />
              </form>
            </div>

            {/* Nav links */}
            <nav className="px-2 py-3 border-b border-peach-light">
              {NAV_LINKS.map(({ label, href, sale }) => (
                <Link key={label} href={href} onClick={() => setOpen(false)}
                  className={`block px-4 py-3 text-[15px] rounded-lg transition-colors hover:bg-whitewash-off ${sale ? 'text-red-600' : 'text-brown'}`}>
                  {label}
                </Link>
              ))}
            </nav>

            {/* Account section */}
            <div className="px-2 py-3">
              {user ? (
                <>
                  <div className="px-4 py-2 mb-1">
                    <p className="text-[13px] font-medium text-brown">{user.full_name ?? 'My Account'}</p>
                    <p className="text-[12px] text-brown-light">{user.email}</p>
                  </div>
                  <Link href="/account" onClick={() => setOpen(false)}
                    className="block px-4 py-3 text-[15px] text-brown rounded-lg hover:bg-whitewash-off transition-colors">
                    Account settings
                  </Link>
                  <Link href="/account/orders" onClick={() => setOpen(false)}
                    className="block px-4 py-3 text-[15px] text-brown rounded-lg hover:bg-whitewash-off transition-colors">
                    My orders
                  </Link>
                  <Link href="/account/addresses" onClick={() => setOpen(false)}
                    className="block px-4 py-3 text-[15px] text-brown rounded-lg hover:bg-whitewash-off transition-colors">
                    Addresses
                  </Link>
                  <button onClick={handleSignOut}
                    className="w-full text-left px-4 py-3 text-[15px] text-red-600 rounded-lg hover:bg-whitewash-off transition-colors mt-1">
                    Sign out
                  </button>
                </>
              ) : (
                <div className="px-4 pt-2 flex flex-col gap-2">
                  <Link href="/register" onClick={() => setOpen(false)}
                    className="w-full text-center bg-brown text-whitewash text-[14px] font-medium rounded-full py-3 hover:bg-brown-light transition-colors">
                    Sign up
                  </Link>
                  <Link href="/login" onClick={() => setOpen(false)}
                    className="w-full text-center text-brown text-[14px] py-2.5 hover:opacity-70 transition-opacity">
                    Log in
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
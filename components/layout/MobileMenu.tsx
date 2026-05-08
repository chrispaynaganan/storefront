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
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <div className="sm:hidden">
      {/* Hamburger */}
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 text-[#3B1F0E]"
        aria-label="Toggle menu"
        aria-expanded={open}
      >
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
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="fixed top-14 left-0 right-0 bottom-0 z-50 bg-[#FAF7F4] overflow-y-auto">

            {/* Search */}
            <div className="px-4 pt-4 pb-3 border-b border-[#E8E2DC]">
              <Link
                href="/products"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 bg-[#EFEFEF] rounded-full h-10 px-4"
              >
                <svg className="w-4 h-4 text-[#888] shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z" />
                </svg>
                <span className="text-[14px] text-[#999]">Search</span>
              </Link>
            </div>

            {/* Nav links */}
            <nav className="px-2 py-3 border-b border-[#E8E2DC]">
              {NAV_LINKS.map(({ label, href, sale }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={[
                    'block px-4 py-3 text-[15px] rounded-lg transition-colors hover:bg-[#F0EAE4]',
                    sale ? 'text-[#CC2222]' : 'text-[#3B1F0E]',
                  ].join(' ')}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Account section */}
            <div className="px-2 py-3">
              {user ? (
                <>
                  <div className="px-4 py-2 mb-1">
                    <p className="text-[13px] font-medium text-[#3B1F0E]">{user.full_name ?? 'My Account'}</p>
                    <p className="text-[12px] text-[#999]">{user.email}</p>
                  </div>
                  <Link href="/account" onClick={() => setOpen(false)}
                    className="block px-4 py-3 text-[15px] text-[#3B1F0E] rounded-lg hover:bg-[#F0EAE4] transition-colors">
                    Account settings
                  </Link>
                  <Link href="/account/orders" onClick={() => setOpen(false)}
                    className="block px-4 py-3 text-[15px] text-[#3B1F0E] rounded-lg hover:bg-[#F0EAE4] transition-colors">
                    My orders
                  </Link>
                  <Link href="/account/addresses" onClick={() => setOpen(false)}
                    className="block px-4 py-3 text-[15px] text-[#3B1F0E] rounded-lg hover:bg-[#F0EAE4] transition-colors">
                    Addresses
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-3 text-[15px] text-[#CC2222] rounded-lg hover:bg-[#F0EAE4] transition-colors mt-1"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <div className="px-4 pt-2 flex flex-col gap-2">
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="w-full text-center bg-[#3B1F0E] text-[#FAF7F4] text-[14px] font-medium rounded-full py-3 hover:bg-[#5a3020] transition-colors"
                  >
                    Sign up
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="w-full text-center text-[#3B1F0E] text-[14px] py-2.5 hover:opacity-70 transition-opacity"
                  >
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
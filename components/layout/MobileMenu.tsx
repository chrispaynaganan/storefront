'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { SearchBar } from '@/components/layout/SearchBar'
import { ChevronDown } from 'lucide-react'
import type { User } from '@/types'

const AUDIENCES = [
  {
    label: 'Women',
    href: '/women',
    links: [
      { label: 'Shop All Women\'s', href: '/women/shop' },
      { label: 'Shirts',           href: '/women/shirts' },
      { label: 'Hoodies',          href: '/women/hoodies' },
      { label: 'New Arrivals',     href: '/new-arrivals?audience=women' },
      { label: 'Best Sellers',     href: '/best-sellers?audience=women' },
    ],
  },
  {
    label: 'Men',
    href: '/men',
    links: [
      { label: 'Shop All Men\'s',  href: '/men/shop' },
      { label: 'Shirts',           href: '/men/shirts' },
      { label: 'Hoodies',          href: '/men/hoodies' },
      { label: 'New Arrivals',     href: '/new-arrivals?audience=men' },
      { label: 'Best Sellers',     href: '/best-sellers?audience=men' },
    ],
  },
  {
    label: 'Kids',
    href: '/kids',
    links: [
      { label: 'Shop All Kids\'',  href: '/kids/shop' },
      { label: 'Shirts',           href: '/kids/shirts' },
      { label: 'Hoodies',          href: '/kids/hoodies' },
      { label: 'New Arrivals',     href: '/new-arrivals?audience=kids' },
      { label: 'Best Sellers',     href: '/best-sellers?audience=kids' },
    ],
  },
  {
    label: 'Sports',
    href: '/sports',
    links: [
      { label: 'Shop All Sports',  href: '/sports/shop' },
      { label: 'Shirts',           href: '/sports/shirts' },
      { label: 'Hoodies',          href: '/sports/hoodies' },
      { label: 'New Arrivals',     href: '/new-arrivals?audience=sports' },
      { label: 'Best Sellers',     href: '/best-sellers?audience=sports' },
    ],
  },
]

const QUICK_LINKS = [
  { label: 'New Arrivals',  href: '/new-arrivals' },
  { label: 'Best Sellers',  href: '/best-sellers' },
  { label: 'Collections',   href: '/collections' },
  { label: 'Lookbook',      href: '/lookbook' },
]

const SUPPORT_LINKS = [
  { label: 'FAQ',           href: '/faq' },
  { label: 'Shipping',      href: '/shipping' },
  { label: 'Returns',       href: '/returns' },
  { label: 'Track Order',   href: '/track-order' },
  { label: 'Contact',       href: '/contact' },
]

interface Props {
  user: User | null
  hasSale: boolean
}

export function MobileMenu({ user, hasSale }: Props) {
  const [open, setOpen] = useState(false)
  const [openAudience, setOpenAudience] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  function close() {
    setOpen(false)
    setOpenAudience(null)
  }

  return (
    <div className="sm:hidden">
      {/* Hamburger */}
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 text-brown"
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
          <div className="fixed inset-0 z-40 bg-black/20" onClick={close} />

          <div className="fixed top-14 left-0 right-0 bottom-0 z-50 bg-whitewash overflow-y-auto">

            {/* Search */}
            <div className="px-4 pt-4 pb-3 border-b border-peach-light">
              <Suspense fallback={null}>
                <SearchBar onNavigate={close} />
              </Suspense>
            </div>

            {/* Audience sections */}
            <nav className="px-2 py-3 border-b border-peach-light">
              {AUDIENCES.map((audience) => (
                <div key={audience.label}>
                  <button
                    onClick={() => setOpenAudience(openAudience === audience.label ? null : audience.label)}
                    className="w-full flex items-center justify-between px-4 py-3 text-[15px] font-medium text-brown rounded-lg hover:bg-whitewash-off transition-colors"
                  >
                    {audience.label}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${openAudience === audience.label ? 'rotate-180' : ''}`}
                      strokeWidth={1.75}
                    />
                  </button>
                  {openAudience === audience.label && (
                    <div className="ml-4 mb-1 flex flex-col">
                      {audience.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={close}
                          className="px-4 py-2.5 text-[14px] text-brown/70 rounded-lg hover:bg-whitewash-off hover:text-brown transition-colors"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Quick links */}
            <nav className="px-2 py-3 border-b border-peach-light">
              {QUICK_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={close}
                  className="block px-4 py-3 text-[15px] text-brown rounded-lg hover:bg-whitewash-off transition-colors"
                >
                  {label}
                </Link>
              ))}
              {hasSale && (
                <Link
                  href="/sale"
                  onClick={close}
                  className="block px-4 py-3 text-[15px] text-red-600 rounded-lg hover:bg-whitewash-off transition-colors"
                >
                  Sale
                </Link>
              )}
            </nav>

            {/* Support links */}
            <nav className="px-2 py-3 border-b border-peach-light">
              <p className="px-4 pb-1 text-[11px] font-semibold text-brown/40 uppercase tracking-widest">Support</p>
              {SUPPORT_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={close}
                  className="block px-4 py-3 text-[15px] text-brown rounded-lg hover:bg-whitewash-off transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Account */}
            <div className="px-2 py-3">
              {user ? (
                <>
                  <div className="px-4 py-2 mb-1">
                    <p className="text-[13px] font-medium text-brown">{user.full_name ?? 'My Account'}</p>
                    <p className="text-[12px] text-brown-light">{user.email}</p>
                  </div>
                  <Link href="/account" onClick={close} className="block px-4 py-3 text-[15px] text-brown rounded-lg hover:bg-whitewash-off transition-colors">Account settings</Link>
                  <Link href="/account/orders" onClick={close} className="block px-4 py-3 text-[15px] text-brown rounded-lg hover:bg-whitewash-off transition-colors">My orders</Link>
                  <Link href="/account/addresses" onClick={close} className="block px-4 py-3 text-[15px] text-brown rounded-lg hover:bg-whitewash-off transition-colors">Addresses</Link>
                  <Link href="/wishlist" onClick={close} className="block px-4 py-3 text-[15px] text-brown rounded-lg hover:bg-whitewash-off transition-colors">Wishlist</Link>
                  <button onClick={handleSignOut} className="w-full text-left px-4 py-3 text-[15px] text-red-600 rounded-lg hover:bg-whitewash-off transition-colors mt-1">
                    Sign out
                  </button>
                </>
              ) : (
                <div className="px-4 pt-2 flex flex-col gap-2">
                  <Link href="/register" onClick={close} className="w-full text-center bg-brown text-whitewash text-[14px] font-medium rounded-full py-3 hover:bg-brown-light transition-colors">
                    Sign up
                  </Link>
                  <Link href="/login" onClick={close} className="w-full text-center text-brown text-[14px] py-2.5 hover:opacity-70 transition-opacity">
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
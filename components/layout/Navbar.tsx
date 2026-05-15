'use client'
import Link from 'next/link'
import { Suspense, useState, useRef, useEffect } from 'react'
import { MobileMenu } from '@/components/layout/MobileMenu'
import { ProfileDropdown } from '@/components/layout/ProfileDropdown'
import { SearchBar } from '@/components/layout/SearchBar'
import { Logo } from '@/components/ui/Logo'
import { useCart } from '@/context/CartContext'
import { Search, ShoppingBag, Heart, ChevronDown, HelpCircle } from 'lucide-react'

const AUDIENCES = [
  {
    label: 'Women',
    href: '/women',
    links: [
      { label: "Shop All Women's", href: '/women/shop' },
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
      { label: "Shop All Men's",  href: '/men/shop' },
      { label: 'Shirts',          href: '/men/shirts' },
      { label: 'Hoodies',         href: '/men/hoodies' },
      { label: 'New Arrivals',    href: '/new-arrivals?audience=men' },
      { label: 'Best Sellers',    href: '/best-sellers?audience=men' },
    ],
  },
  {
    label: 'Kids',
    href: '/kids',
    links: [
      { label: "Shop All Kids'",  href: '/kids/shop' },
      { label: 'Shirts',          href: '/kids/shirts' },
      { label: 'Hoodies',         href: '/kids/hoodies' },
      { label: 'New Arrivals',    href: '/new-arrivals?audience=kids' },
      { label: 'Best Sellers',    href: '/best-sellers?audience=kids' },
    ],
  },
  {
    label: 'Sports',
    href: '/sports',
    links: [
      { label: 'Shop All Sports', href: '/sports/shop' },
      { label: 'Shirts',          href: '/sports/shirts' },
      { label: 'Hoodies',         href: '/sports/hoodies' },
      { label: 'New Arrivals',    href: '/new-arrivals?audience=sports' },
      { label: 'Best Sellers',    href: '/best-sellers?audience=sports' },
    ],
  },
]

const PILL_LINKS = [
  { label: 'New Arrivals', href: '/new-arrivals' },
  { label: 'Best Sellers', href: '/best-sellers' },
  { label: 'Women',        href: '/women' },
  { label: 'Men',          href: '/men' },
  { label: 'Kids',         href: '/kids' },
  { label: 'Sports',       href: '/sports' },
  { label: 'Collections',  href: '/collections' },
]

const HELP_LINKS = [
  { label: 'FAQ',             href: '/faq' },
  { label: 'Shipping',        href: '/shipping' },
  { label: 'Returns',         href: '/returns' },
  { label: 'Contact Us',      href: '/contact' },
  { label: 'Privacy Policy',  href: '/privacy' },
  { label: 'Terms of Service',href: '/terms' },
  { label: 'Accessibility',   href: '/accessibility' },
]

type Props = {
  user: any
  hasSale: boolean
}

export function Navbar({ user, hasSale }: Props) {
  const { cartCount } = useCart()
  const [openAudience, setOpenAudience] = useState<string | null>(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const helpRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenAudience(null)
      }
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) {
        setHelpOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">

      {/* ── TOP ROW ── */}
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center">

          {/* Mobile: help icon | logo | hamburger */}
          <div className="flex items-center justify-between w-full sm:hidden">
            {/* Help icon — mobile */}
            <div className="relative" ref={helpRef}>
              <button
  onClick={() => setHelpOpen(v => !v)}
  className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-gray-900 transition-colors"
  aria-label="Help"
>
  <HelpCircle className="w-6 h-6" strokeWidth={1.5} />
  <span className="text-[11px] text-gray-500 tracking-wide">Help</span>
</button>
              {helpOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
                  <p className="px-4 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Help</p>
                  {HELP_LINKS.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setHelpOpen(false)}
                      className="block px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/" aria-label="Known & Worn — home">
              <Logo width={150} />
            </Link>
            <MobileMenu user={user} hasSale={hasSale} />
          </div>

          {/* Tablet/Desktop: help left | logo center | icons right */}
          <div className="hidden sm:flex items-center w-full">

            {/* Help dropdown — left */}
<div className="flex-1 flex items-center">
  <div className="relative" ref={helpRef}>
    <button
      onClick={() => setHelpOpen(v => !v)}
      className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-gray-900 transition-colors"
      aria-label="Help"
    >
      <HelpCircle className="w-6 h-6" strokeWidth={1.5} />
      <span className="text-[11px] text-gray-500 tracking-wide">Help</span>
    </button>
    {helpOpen && (
      <div className="absolute top-full left-0 mt-3 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
        <p className="px-4 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Help</p>
        {HELP_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setHelpOpen(false)}
            className="block px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
    )}
  </div>
</div>

            {/* Logo — center */}
            <Link href="/" aria-label="Known & Worn — home" className="absolute left-1/2 -translate-x-1/2">
              <Logo width={150} />
            </Link>

            {/* Icons — right */}
            <div className="flex-1 flex items-center justify-end gap-6">
              {/* Bag */}
              <Link href="/cart" className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-gray-900 transition-colors">
                <div className="relative">
                  <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brown text-white text-[10px] flex items-center justify-center font-semibold leading-none">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-gray-500 tracking-wide">Bag</span>
              </Link>

              {/* Favorites */}
              <Link href="/favorites" className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-gray-900 transition-colors">
                <Heart className="w-6 h-6" strokeWidth={1.5} />
                <span className="text-[11px] text-gray-500 tracking-wide">Favorites</span>
              </Link>

              {/* Profile */}
              {user ? (
                <ProfileDropdown user={user} />
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="text-[13px] text-brown hover:opacity-70 transition-opacity px-3 py-1.5">
                    Log in
                  </Link>
                  <Link href="/register" className="text-[13px] bg-brown text-white hover:opacity-80 transition-opacity rounded-full px-4 py-1.5">
                    Sign up
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW (tablet/desktop only) ── */}
      <div className="hidden sm:block border-t border-gray-100">
        <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-14 flex items-center gap-3" ref={navRef}>

            {/* Audience dropdowns */}
            <div className="flex items-center gap-1 shrink-0">
              {AUDIENCES.map((audience) => (
                <div key={audience.label} className="relative">
                  <button
                    onClick={() => setOpenAudience(openAudience === audience.label ? null : audience.label)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
                  >
                    {audience.label}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${openAudience === audience.label ? 'rotate-180' : ''}`}
                      strokeWidth={1.75}
                    />
                  </button>

                  {openAudience === audience.label && (
                    <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
                      <Link
                        href={audience.href}
                        onClick={() => setOpenAudience(null)}
                        className="block px-4 py-2 text-[13px] font-semibold text-brown hover:bg-gray-50 transition-colors"
                      >
                        {audience.label} Overview
                      </Link>
                      <div className="my-1 border-t border-gray-100" />
                      {audience.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setOpenAudience(null)}
                          className="block px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-200 shrink-0" />

            {/* Search */}
            <div className="shrink-0 w-44 lg:w-60">
              <Suspense fallback={
                <div className="w-full bg-gray-50 rounded-full h-9 px-4 flex items-center gap-2 border border-gray-200">
                  <span className="text-[13px] text-gray-400 flex-1">Search</span>
                  <Search className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={1.5} />
                </div>
              }>
                <SearchBar />
              </Suspense>
            </div>

            {/* Pill nav — pushed right */}
            <nav className="flex items-center gap-2 overflow-x-auto scrollbar-hide ml-auto">
              {PILL_LINKS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="shrink-0 px-4 py-2 rounded-full border border-gray-200 text-[13px] text-gray-700 whitespace-nowrap font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors"
                >
                  {label}
                </Link>
              ))}
              {hasSale && (
                <Link
                  href="/sale"
                  className="shrink-0 px-4 py-2 rounded-full border border-red-200 text-[13px] text-red-500 whitespace-nowrap font-medium hover:border-red-300 hover:bg-red-50 transition-colors"
                >
                  Sale
                </Link>
              )}
            </nav>

          </div>
        </div>
      </div>

    </header>
  )
}
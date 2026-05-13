'use client'
import Link from 'next/link'
import { Suspense, useState, useRef, useEffect } from 'react'
import { MobileMenu } from '@/components/layout/MobileMenu'
import { ProfileDropdown } from '@/components/layout/ProfileDropdown'
import { SearchBar } from '@/components/layout/SearchBar'
import { Logo } from '@/components/ui/Logo'
import { useCart } from '@/context/CartContext'
import { Search, ShoppingBag, Heart, ChevronDown } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Women',   href: '/women' },
  { label: 'Men',     href: '/men' },
  { label: 'Kids',    href: '/kids' },
  { label: 'Hoodies', href: '/collections/hoodies' },
  { label: 'Shirts',  href: '/collections/shirts' },
  { label: 'New',     href: '/new' },
  { label: 'Sports',  href: '/sports' },
  { label: 'Sale',    href: '/sale', sale: true },
]

const CATEGORIES = [
  { label: 'Women',        href: '/women' },
  { label: 'Men',          href: '/men' },
  { label: 'Kids',         href: '/kids' },
  { label: 'Sports',       href: '/sports' },
  { label: 'Hoodies',      href: '/collections/hoodies' },
  { label: 'Shirts',       href: '/collections/shirts' },
  { label: 'New arrivals', href: '/new' },
  { label: 'Sale',         href: '/sale' },
]

type Props = {
  user: any
}

export function Navbar({ user }: Props) {
  const { cartCount } = useCart()
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const categoriesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target as Node)) {
        setCategoriesOpen(false)
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

          {/* Mobile layout: search | logo (centered) | hamburger */}
          <div className="flex items-center justify-between w-full sm:hidden">
            <button className="p-2 -ml-2 text-gray-500 hover:text-gray-800 transition-colors" aria-label="Search">
              <Search className="w-5 h-5" strokeWidth={1.75} />
            </button>
            <Link href="/" aria-label="Known & Worn — home">
              <Logo width={150} />
            </Link>
            <MobileMenu user={user} />
          </div>

          {/* Tablet/Desktop layout: logo | spacer | bag + favorites + avatar */}
          <div className="hidden sm:flex items-center w-full">
            {/* Logo — centered via absolute trick */}
            <div className="flex-1" />
            <Link href="/" aria-label="Known & Worn — home" className="absolute left-1/2 -translate-x-1/2">
              <Logo width={150} />
            </Link>
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
          <div className="h-14 flex items-center gap-3">

            {/* Categories dropdown */}
            <div className="relative shrink-0" ref={categoriesRef}>
              <button
                onClick={() => setCategoriesOpen(v => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 text-[13px] text-gray-700 hover:border-gray-400 transition-colors whitespace-nowrap"
              >
                Categories
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`}
                  strokeWidth={1.75}
                />
              </button>

              {categoriesOpen && (
                <div className="absolute top-full left-0 mt-2 w-44 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      onClick={() => setCategoriesOpen(false)}
                      className="block px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Search input */}
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

            {/* Pill nav links — pushed right, scrollable on tablet */}
            <nav className="flex items-center gap-2 overflow-x-auto scrollbar-hide ml-auto">
              {NAV_LINKS.map(({ label, href, sale }) => (
                <Link
                  key={label}
                  href={href}
                  className={`
                    shrink-0 px-4 py-2 rounded-full border text-[13px] whitespace-nowrap font-medium transition-colors
                    ${sale
                      ? 'border-red-200 text-red-500 hover:border-red-300 hover:bg-red-50'
                      : 'border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                    }
                  `}
                >
                  {label}
                </Link>
              ))}
            </nav>

          </div>
        </div>
      </div>

    </header>
  )
}
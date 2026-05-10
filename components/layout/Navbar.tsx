'use client'
import Link from 'next/link'
import { Suspense } from 'react'
import { CartIcon } from '@/components/cart/CartIcon'
import { FavoritesIcon } from '@/components/layout/FavoritesIcon'
import { MobileMenu } from '@/components/layout/MobileMenu'
import { ProfileDropdown } from '@/components/layout/ProfileDropdown'
import { SearchBar } from '@/components/layout/SearchBar'
import { useCart } from '@/context/CartContext'

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

type Props = {
  user: any
}

export function Navbar({ user }: Props) {
  const { cartCount } = useCart()

  return (
    <header className="sticky top-0 z-50 bg-whitewash/95 backdrop-blur-sm border-b border-peach-light">
      {/* Top row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="shrink-0 font-serif text-sm font-bold tracking-wide text-brown uppercase">
          KNOWN<span className="text-brown-light font-normal">&</span>WORN
        </Link>

        {/* Search bar — tablet+ */}
        <div className="hidden sm:flex flex-1 max-w-xs lg:max-w-sm">
          <Suspense fallback={
            <div className="w-full bg-whitewash-off rounded-full h-8.5 px-4 flex items-center">
              <span className="text-[13px] text-brown-light/60">Search products...</span>
            </div>
          }>
            <SearchBar />
          </Suspense>
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3 sm:gap-5">
          <FavoritesIcon />
          <CartIcon count={cartCount} />
          {user ? (
            <ProfileDropdown user={user} />
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login"
                className="text-[13px] text-brown hover:text-brown-light transition-colors px-3 py-1.5">
                Log in
              </Link>
              <Link href="/register"
                className="text-[13px] bg-brown text-whitewash hover:bg-brown-light transition-colors rounded-full px-4 py-1.5">
                Sign up
              </Link>
            </div>
          )}
          <MobileMenu user={user} />
        </div>
      </div>

      {/* Bottom nav row — tablet+ */}
      <div className="hidden sm:block border-t border-peach-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center gap-6 lg:gap-8">
          {NAV_LINKS.map(({ label, href, sale }) => (
            <Link key={label} href={href}
              className={`text-[13px] whitespace-nowrap hover:opacity-70 transition-opacity ${sale ? 'text-red-600' : 'text-brown'}`}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
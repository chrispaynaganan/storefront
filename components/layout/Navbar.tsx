import Link from 'next/link'
import { CartIcon } from '@/components/cart/CartIcon'
import { FavoritesIcon } from '@/components/layout/FavoritesIcon'
import { MobileMenu } from '@/components/layout/MobileMenu'
import { ProfileDropdown } from '@/components/layout/ProfileDropdown'
import { createServerSupabaseClient } from '@/lib/supabase-server'
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

export async function Navbar({ user }: Props) {
  let cartCount = 0
  if (user) {
    const supabase = await createServerSupabaseClient()
    const { count } = await supabase
      .from('cart_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    cartCount = count ?? 0
  }

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F4]/95 backdrop-blur-sm border-b border-[#E8E2DC]">
      {/* Top row */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="shrink-0 font-serif text-sm font-bold tracking-wide text-[#3B1F0E] uppercase">
          KNOWN<span className="text-[#AAAAAA] font-normal">&</span>WORN
        </Link>

        {/* Search */}
        <div className="hidden sm:flex flex-1 max-w-xs lg:max-w-sm">
          <Link
            href="/products"
            className="w-full flex items-center gap-2 bg-[#EFEFEF] hover:bg-[#E8E8E8] transition-colors rounded-full h-[34px] px-4"
          >
            <svg className="w-3.5 h-3.5 text-[#888] shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z" />
            </svg>
            <span className="text-[13px] text-[#999]">Search</span>
          </Link>
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3 sm:gap-5">
          <FavoritesIcon />
          <CartIcon count={cartCount} />

          {user ? (
            <ProfileDropdown user={user} />
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="text-[13px] text-[#3B1F0E] hover:text-[#6B3A22] transition-colors px-3 py-1.5"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="text-[13px] bg-[#3B1F0E] text-[#FAF7F4] hover:bg-[#5a3020] transition-colors rounded-full px-4 py-1.5"
              >
                Sign up
              </Link>
            </div>
          )}

          <MobileMenu user={user} />
        </div>
      </div>

      {/* Bottom nav row — tablet+ */}
      <div className="hidden sm:block border-t border-[#E8E2DC]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center gap-6 lg:gap-8">
          {NAV_LINKS.map(({ label, href, sale }) => (
            <Link
              key={label}
              href={href}
              className={[
                'text-[13px] whitespace-nowrap hover:opacity-70 transition-opacity',
                sale ? 'text-[#CC2222]' : 'text-[#3B1F0E]',
              ].join(' ')}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
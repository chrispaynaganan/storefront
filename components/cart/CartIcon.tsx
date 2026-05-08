'use client'
import Link from 'next/link'

interface Props { count?: number }

export function CartIcon({ count = 0 }: Props) {
  return (
    <Link
      href="/cart"
      className="flex flex-col items-center gap-0.5 text-[#3B1F0E] hover:opacity-70 transition-opacity relative"
      aria-label={`Bag${count > 0 ? `, ${count} item${count !== 1 ? 's' : ''}` : ''}`}
    >
      <div className="relative">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-[#3B1F0E] text-white text-[9px] font-medium rounded-full flex items-center justify-center leading-none">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </div>
      <span className="hidden sm:block text-[10px] font-normal tracking-wide">Bag</span>
    </Link>
  )
}
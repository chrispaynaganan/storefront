'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@/types'
import Image from 'next/image'

interface Props { user: User }

export function ProfileDropdown({ user }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  const initials = user.full_name
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user.email.slice(0, 2).toUpperCase()

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
  onClick={() => setOpen(!open)}
  className="w-8 h-8 rounded-full bg-[#3B1F0E] text-[#FAF7F4] text-[11px] font-medium flex items-center justify-center hover:bg-[#5a3020] transition-colors overflow-hidden"
  aria-label="Account menu"
  aria-expanded={open}
>
  {user.avatar_url ? (
    <Image
      src={user.avatar_url}
      alt={user.full_name ?? 'Avatar'}
      width={32}
      height={32}
      className="w-full h-full object-cover"
    />
  ) : (
    initials
  )}
</button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-[#FAF7F4] border border-[#E8E2DC] rounded-xl shadow-md overflow-hidden z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-[#E8E2DC]">
            <p className="text-[13px] font-medium text-[#3B1F0E] truncate">
              {user.full_name ?? 'My Account'}
            </p>
            <p className="text-[11px] text-[#999] truncate">{user.email}</p>
          </div>

          {/* Links */}
          <nav className="py-1">
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-[13px] text-[#3B1F0E] hover:bg-[#F0EAE4] transition-colors"
            >
              Account settings
            </Link>
            <Link
              href="/account/orders"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-[13px] text-[#3B1F0E] hover:bg-[#F0EAE4] transition-colors"
            >
              My orders
            </Link>
            <Link
              href="/account/addresses"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-[13px] text-[#3B1F0E] hover:bg-[#F0EAE4] transition-colors"
            >
              Addresses
            </Link>
          </nav>

          {/* Sign out */}
          <div className="border-t border-[#E8E2DC] py-1">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2.5 text-[13px] text-[#CC2222] hover:bg-[#F0EAE4] transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
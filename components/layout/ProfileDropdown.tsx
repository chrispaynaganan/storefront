'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@/types'
import Image from 'next/image'
import { User as UserIcon, ShoppingBag, MapPin, LayoutDashboard, LogOut } from 'lucide-react'

interface Props { user: User }

export function ProfileDropdown({ user }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

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

  const isAdmin = user.role === 'admin'

  const navLinks = [
    { href: '/account', label: 'Account settings', icon: UserIcon },
    { href: '/account/orders', label: 'My orders', icon: ShoppingBag },
    { href: '/account/addresses', label: 'Addresses', icon: MapPin },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin dashboard', icon: LayoutDashboard }] : []),
  ]

  return (
    <div ref={ref} className="relative hidden sm:block">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-brown text-whitewash text-[11px] font-medium flex items-center justify-center hover:bg-brown-light transition-colors overflow-hidden ring-2 ring-transparent hover:ring-peach"
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

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-brown rounded-2xl shadow-xl overflow-hidden z-50 border border-white/10">

          {/* User info */}
          <div className="px-4 py-3.5 border-b border-white/10">
            <p className="text-[13px] font-semibold text-whitewash truncate leading-tight">
              {user.full_name ?? 'My Account'}
            </p>
            <p className="text-[11px] text-peach/70 truncate mt-0.5">{user.email}</p>
          </div>

          {/* Nav links */}
          <nav className="py-1.5">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-whitewash/80 hover:text-whitewash hover:bg-white/10 transition-colors"
              >
                <Icon size={14} className="shrink-0 text-peach/60" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Sign out */}
          <div className="border-t border-white/10 py-1.5">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors"
            >
              <LogOut size={14} className="shrink-0" />
              Sign out
            </button>
          </div>

        </div>
      )}
    </div>
  )
}
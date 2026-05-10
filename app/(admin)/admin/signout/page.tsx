'use client'

// app/(admin)/admin/signout/page.tsx
// Standalone sign-out confirmation — linked from the sidebar "Sign Out" button
// as a fallback route, or used directly via /admin/signout.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AdminSignOutPage() {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    async function getUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUserEmail(user?.email ?? null)
    }
    getUser()
  }, [])

  async function handleSignOut() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function handleCancel() {
    router.back()
  }

  return (
    <div className="min-h-screen bg-whitewash flex items-center justify-center px-5">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-10">
          <p className="text-xs font-extrabold tracking-[0.25em] text-brown uppercase mb-1">
            Known&amp;Worn
          </p>
          <p className="text-xs text-brown/40 tracking-widest uppercase">Admin</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-whitewash-off shadow-sm p-8 flex flex-col items-center gap-6 text-center">

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-peach-light flex items-center justify-center">
            <svg className="w-7 h-7 text-brown" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-brown">Sign out?</h1>
            {userEmail && (
              <p className="text-sm text-brown/40 mt-1.5">
                Signed in as <span className="font-medium text-brown/60">{userEmail}</span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full bg-brown text-white font-semibold rounded-2xl py-3.5 flex items-center justify-center gap-2 hover:bg-brown-light transition disabled:opacity-50"
            >
              {signingOut ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : null}
              {signingOut ? 'Signing out…' : 'Yes, sign out'}
            </button>
            <button
              onClick={handleCancel}
              disabled={signingOut}
              className="w-full bg-gray-100 text-brown font-semibold rounded-2xl py-3.5 hover:bg-gray-200 transition disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
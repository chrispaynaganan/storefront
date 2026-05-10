'use client'

// app/(auth)/reset-password/page.tsx
// Supabase redirects here after the user clicks the reset link in their email.
// The session is automatically set by Supabase via the URL hash.

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  // Supabase puts the session tokens in the URL hash on redirect.
  // We listen for the PASSWORD_RECOVERY event to confirm the session is live.
  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password) { setError('Please enter a new password.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true); setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    // Sign out and redirect to login with a success indicator
    await supabase.auth.signOut()
    router.push('/login?reset=success')
  }

  // ── Waiting for session ──
  if (!ready) {
    return (
      <div className="min-h-screen bg-whitewash flex items-center justify-center px-5">
        <div className="text-center flex flex-col items-center gap-4">
          <svg className="w-6 h-6 animate-spin text-brown/40" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-sm text-brown/40">Verifying your reset link…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-whitewash flex items-center justify-center px-5">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-10">
          <p className="text-xs font-extrabold tracking-[0.25em] text-brown uppercase mb-1">
            Known&amp;Worn
          </p>
          <h1 className="text-3xl font-bold text-brown tracking-tight">New password</h1>
          <p className="text-sm text-brown/40 mt-2">Choose a strong password</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* New password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-brown/70">New password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                autoFocus
                className="w-full bg-white border border-whitewash-off rounded-2xl px-4 py-3.5 pr-12 text-sm text-brown placeholder:text-brown/25 outline-none focus:ring-2 focus:ring-peach transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brown/30 hover:text-brown/60 transition"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {/* Strength hint */}
            {password.length > 0 && (
              <p className={`text-xs mt-0.5 ${password.length < 8 ? 'text-red-400' : 'text-green-600'}`}>
                {password.length < 8 ? `${8 - password.length} more characters needed` : 'Looks good'}
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-brown/70">Confirm password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              autoComplete="new-password"
              className="w-full bg-white border border-whitewash-off rounded-2xl px-4 py-3.5 text-sm text-brown placeholder:text-brown/25 outline-none focus:ring-2 focus:ring-peach transition"
            />
            {confirm.length > 0 && password !== confirm && (
              <p className="text-xs text-red-400 mt-0.5">Passwords don't match</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brown text-white font-semibold rounded-2xl py-3.5 flex items-center justify-center gap-2 hover:bg-brown-light transition disabled:opacity-50 mt-1"
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            )}
            {loading ? 'Saving…' : 'Set new password'}
          </button>
        </form>

      </div>
    </div>
  )
}
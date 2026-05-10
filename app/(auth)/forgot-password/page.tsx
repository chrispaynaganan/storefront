'use client'

// app/(auth)/forgot-password/page.tsx

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) { setError('Please enter your email.'); return }
    setLoading(true); setError('')

    const supabase = createClient()
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-whitewash flex items-center justify-center px-5">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-10">
          <p className="text-xs font-extrabold tracking-[0.25em] text-brown uppercase mb-1">
            Known&amp;Worn
          </p>
          <h1 className="text-3xl font-bold text-brown tracking-tight">
            {sent ? 'Check your email' : 'Forgot password'}
          </h1>
          <p className="text-sm text-brown/40 mt-2">
            {sent
              ? `We sent a reset link to ${email}`
              : 'Enter your email and we\'ll send you a reset link'}
          </p>
        </div>

        {sent ? (
          /* ── Success state ── */
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-3xl border border-whitewash-off p-6 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-peach-light flex items-center justify-center">
                <svg className="w-6 h-6 text-brown" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-brown/60 leading-relaxed">
                Click the link in the email to reset your password. If you don't see it, check your spam folder.
              </p>
            </div>

            <button
              onClick={() => { setSent(false); setEmail('') }}
              className="w-full bg-gray-100 text-brown font-semibold rounded-2xl py-3.5 hover:bg-gray-200 transition text-sm"
            >
              Try a different email
            </button>

            <Link
              href="/login"
              className="w-full bg-brown text-white font-semibold rounded-2xl py-3.5 flex items-center justify-center hover:bg-brown-light transition text-sm"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          /* ── Form state ── */
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-brown/70">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
                className="w-full bg-white border border-whitewash-off rounded-2xl px-4 py-3.5 text-sm text-brown placeholder:text-brown/25 outline-none focus:ring-2 focus:ring-peach transition"
              />
            </div>

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
              {loading ? 'Sending…' : 'Send reset link'}
            </button>

            <Link
              href="/login"
              className="text-center text-sm text-brown/40 hover:text-brown transition"
            >
              Back to sign in
            </Link>
          </form>
        )}

      </div>
    </div>
  )
}
'use client'

// app/(auth)/register/page.tsx

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null)
  const [error, setError] = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName || !email || !password) { setError('Please fill in all fields.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true); setError('')

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Insert into users table (role defaults to 'customer')
    if (data.user) {
      await supabase.from('users').upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role: 'customer',
        is_active: true,
      })
    }

    router.push('/login?registered=true')
  }

  async function handleSocialLogin(provider: 'google' | 'facebook') {
    setSocialLoading(provider)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen bg-whitewash flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-10">
          <Link href="/" className="text-xs font-extrabold tracking-[0.25em] text-brown uppercase mb-1 inline-block">
            Known&amp;Worn
          </Link>
          <h1 className="text-3xl font-bold text-brown tracking-tight">Create account</h1>
          <p className="text-sm text-brown/40 mt-2">Join the Known&amp;Worn community</p>
        </div>

        {/* Social login */}
        <div className="flex flex-col gap-3 mb-6">
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={!!socialLoading}
            className="w-full bg-white border border-whitewash-off rounded-2xl py-3.5 flex items-center justify-center gap-3 text-sm font-semibold text-brown hover:border-peach hover:bg-peach-light/20 transition disabled:opacity-50"
          >
            {socialLoading === 'google' ? (
              <svg className="w-4 h-4 animate-spin text-brown/40" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>

          <button
            onClick={() => handleSocialLogin('facebook')}
            disabled={!!socialLoading}
            className="w-full bg-[#1877F2] rounded-2xl py-3.5 flex items-center justify-center gap-3 text-sm font-semibold text-white hover:bg-[#166FE5] transition disabled:opacity-50"
          >
            {socialLoading === 'facebook' ? (
              <svg className="w-4 h-4 animate-spin text-white/60" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
            ) : (
              <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            )}
            Continue with Facebook
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-whitewash-off" />
          <span className="text-xs text-brown/30 font-medium">or sign up with email</span>
          <div className="flex-1 h-px bg-whitewash-off" />
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-brown/70">Full name</label>
            <input
              type="text"
              placeholder="Juan dela Cruz"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              autoComplete="name"
              className="w-full bg-white border border-whitewash-off rounded-2xl px-4 py-3.5 text-sm text-brown placeholder:text-brown/25 outline-none focus:ring-2 focus:ring-peach transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-brown/70">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full bg-white border border-whitewash-off rounded-2xl px-4 py-3.5 text-sm text-brown placeholder:text-brown/25 outline-none focus:ring-2 focus:ring-peach transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-brown/70">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full bg-white border border-whitewash-off rounded-2xl px-4 py-3.5 pr-12 text-sm text-brown placeholder:text-brown/25 outline-none focus:ring-2 focus:ring-peach transition"
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-brown/30 hover:text-brown/60 transition" tabIndex={-1}>
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
            {password.length > 0 && (
              <p className={`text-xs mt-0.5 ${password.length < 8 ? 'text-red-400' : 'text-green-600'}`}>
                {password.length < 8 ? `${8 - password.length} more characters needed` : 'Looks good'}
              </p>
            )}
          </div>

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

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-brown text-white font-semibold rounded-2xl py-3.5 flex items-center justify-center gap-2 hover:bg-brown-light transition disabled:opacity-50 mt-1">
            {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
            {loading ? 'Creating account…' : 'Create account'}
          </button>

          <p className="text-center text-xs text-brown/30 leading-relaxed">
            By creating an account you agree to our{' '}
            <Link href="/terms" className="underline hover:text-brown transition">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline hover:text-brown transition">Privacy Policy</Link>.
          </p>
        </form>

        <p className="text-center text-sm text-brown/40 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-brown font-semibold hover:underline">Sign in</Link>
        </p>

      </div>
    </div>
  )
}
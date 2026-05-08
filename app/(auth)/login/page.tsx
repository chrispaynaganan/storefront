'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.log('Login error:', error)
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#FFE8D6]">
      <h1 className="text-2xl font-light text-[#3B1F0E] mb-6">Sign in</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full bg-[#3B1F0E] text-white hover:bg-[#6B3A22] py-3 rounded-lg" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm text-[#6B3A22] space-y-1">
        <Link href="/forgot-password" className="block hover:text-[#3B1F0E]">Forgot password?</Link>
        <span>No account? </span>
        <Link href="/register" className="underline hover:text-[#3B1F0E]">Create one</Link>
      </div>
    </div>
  )
}
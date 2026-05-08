'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        email,
        full_name: fullName,
        role: 'customer',
        is_active: true,
      })
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#FFE8D6]">
      <h1 className="text-2xl font-light text-[#3B1F0E] mb-6">Create account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Juan dela Cruz" />
        <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={loading}
          className="w-full bg-[#3B1F0E] text-white hover:bg-[#6B3A22] py-3 rounded-lg">
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-[#6B3A22]">
        Already have an account?{' '}
        <Link href="/login" className="underline hover:text-[#3B1F0E]">Sign in</Link>
      </p>
    </div>
  )
}
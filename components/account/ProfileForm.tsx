'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import type { User } from '@/types'

export function ProfileForm({ user }: { user: User | null }) {
  const router = useRouter()
  const [fullName, setFullName] = useState(user?.full_name ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    await supabase.from('users').update({ full_name: fullName }).eq('id', user?.id)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
    router.refresh()
  }

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="max-w-md space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full name" value={fullName} onChange={e => setFullName(e.target.value)} />
        <Input label="Email" value={user?.email ?? ''} disabled
          className="opacity-60 cursor-not-allowed" />
        <Button type="submit" disabled={saving}
          className="bg-[#3B1F0E] text-white hover:bg-[#6B3A22] px-6 py-2.5 rounded-lg">
          {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save changes'}
        </Button>
      </form>

      <div className="border-t border-[#FFE8D6] pt-6">
        <p className="text-sm font-medium text-[#3B1F0E] mb-1">Sign out</p>
        <p className="text-xs text-[#6B3A22] mb-3">You will be signed out of your account.</p>
        <Button type="button" variant="outline" onClick={handleLogout} disabled={loggingOut}
          className="border-[#3B1F0E] text-[#3B1F0E] px-6 py-2.5 rounded-lg">
          {loggingOut ? 'Signing out...' : 'Sign out'}
        </Button>
      </div>
    </div>
  )
}
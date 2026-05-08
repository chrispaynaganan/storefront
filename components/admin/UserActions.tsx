'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Props { userId: string; isActive: boolean; role: string }

export function UserActions({ userId, isActive, role }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggleActive() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('users').update({ is_active: !isActive }).eq('id', userId)
    router.refresh()
    setLoading(false)
  }

  async function toggleRole() {
    setLoading(true)
    const supabase = createClient()
    const newRole = role === 'admin' ? 'customer' : 'admin'
    await supabase.from('users').update({ role: newRole }).eq('id', userId)
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex gap-3">
      <button onClick={toggleActive} disabled={loading}
        className={`text-xs underline transition-colors ${isActive ? 'text-red-400 hover:text-red-600' : 'text-green-600 hover:text-green-800'}`}>
        {isActive ? 'Deactivate' : 'Activate'}
      </button>
      <button onClick={toggleRole} disabled={loading}
        className="text-xs text-[#6B3A22] hover:text-[#3B1F0E] underline">
        Make {role === 'admin' ? 'customer' : 'admin'}
      </button>
    </div>
  )
}
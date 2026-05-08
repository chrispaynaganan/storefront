'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']

interface Props { orderId: string; currentStatus: string }

export function OrderStatusUpdater({ orderId, currentStatus }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [saving, setSaving] = useState(false)

  async function update(newStatus: string) {
    setSaving(true)
    setStatus(newStatus)
    const supabase = createClient()
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    router.refresh()
    setSaving(false)
  }

  return (
    <select
      value={status}
      onChange={e => update(e.target.value)}
      disabled={saving}
      className="text-xs px-2 py-1.5 rounded-lg border border-[#FFE8D6] bg-white text-[#3B1F0E] focus:outline-none focus:ring-1 focus:ring-[#FFCBA4]"
    >
      {STATUSES.map(s => (
        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
      ))}
    </select>
  )
}
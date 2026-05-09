'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Badge } from '@/components/ui/Badge'
import type { Address } from '@/types'

export function AddressCard({ address }: { address: Address }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Remove this address?')) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('addresses').delete().eq('id', address.id)
    router.refresh()
  }

  async function handleSetDefault() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id)
    await supabase.from('addresses').update({ is_default: true }).eq('id', address.id)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-xl border border-peach-light p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-brown">{address.line1}</p>
          {address.line2 && <p className="text-xs text-brown-light mt-0.5">{address.line2}</p>}
          <p className="text-xs text-brown-light">{address.city}, {address.province}</p>
          <p className="text-xs text-brown-light">{address.country} {address.postal_code}</p>
        </div>
        {address.is_default && (
          <Badge variant="peach" className="shrink-0 ml-2">Default</Badge>
        )}
      </div>
      <div className="flex items-center gap-3 pt-3 border-t border-peach-light">
        {!address.is_default && (
          <button
            onClick={handleSetDefault}
            className="text-xs text-brown-light hover:text-brown underline"
          >
            Set as default
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-red-400 hover:text-red-600 underline ml-auto"
        >
          {deleting ? 'Removing...' : 'Remove'}
        </button>
      </div>
    </div>
  )
}
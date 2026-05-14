'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface Props {
  onApply: (discount: number, code: string) => void
  subtotal: number
}

export function PromoCodeInput({ onApply, subtotal }: Props) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [applied, setApplied] = useState(false)

  async function handleApply() {
    if (!code.trim()) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const now = new Date().toISOString()

    const { data: promo } = await supabase
      .from('promos')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (!promo) {
      setError('Invalid or expired promo code.')
      setLoading(false)
      return
    }

    // Check date validity
    if (promo.starts_at && now < promo.starts_at) {
      setError('This promo is not active yet.')
      setLoading(false)
      return
    }
    if (promo.ends_at && now > promo.ends_at) {
      setError('This promo has expired.')
      setLoading(false)
      return
    }

    // Calculate discount
    let discount = 0
    if (promo.type === 'percent') {
      discount = (subtotal * promo.value) / 100
    } else {
      discount = promo.value
    }

    discount = Math.min(discount, subtotal)
    onApply(discount, code.toUpperCase())
    setApplied(true)
    setLoading(false)
  }

  if (applied) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
        <span className="text-green-700 text-sm">✓ Promo code applied</span>
        <button
          onClick={() => { setApplied(false); setCode(''); onApply(0, '') }}
          className="ml-auto text-xs text-green-600 underline"
        >
          Remove
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Promo code"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          className="flex-1"
        />
        <Button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          variant="outline"
          className="border-brown text-brown px-4 py-2.5 rounded-lg shrink-0"
        >
          {loading ? '...' : 'Apply'}
        </Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
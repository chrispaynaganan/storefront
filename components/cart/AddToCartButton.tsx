'use client'
import { useState } from 'react'
import { ProductVariantSelector } from '@/components/products/ProductVariantSelector'
import { createClient } from '@/lib/supabase'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'
import type { Variant } from '@/types'

interface Props { variants: Variant[]; productId: string }

export function AddToCartButton({ variants, productId }: Props) {
  const [selected, setSelected] = useState<Variant | null>(null)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const { refreshCart } = useCart()

  const total = selected ? selected.price * qty : null

  async function handleAddToCart() {
    if (!selected) return
    setAdding(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    // Check if already in cart — if so, increment qty
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, qty')
      .eq('user_id', user.id)
      .eq('variant_id', selected.id)
      .single()

    if (existing) {
      await supabase
        .from('cart_items')
        .update({ qty: existing.qty + qty })
        .eq('id', existing.id)
    } else {
      await supabase.from('cart_items').insert({
        user_id: user.id,
        variant_id: selected.id,
        qty,
      })
    }

    await refreshCart()
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
    setAdding(false)
  }

  return (
    <div className="mt-8 space-y-5">
      <ProductVariantSelector variants={variants} onSelect={setSelected} />

      {/* Quantity selector */}
      <div>
        <p className="text-sm text-brown mb-2">Quantity</p>
        <div className="flex items-center border border-peach rounded-lg overflow-hidden w-fit">
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center text-brown hover:bg-whitewash-off transition-colors text-lg"
          >
            −
          </button>
          <span className="w-10 text-center text-sm font-medium text-brown">{qty}</span>
          <button
            onClick={() => setQty(q => Math.min(selected?.stock_qty ?? 10, q + 1))}
            className="w-10 h-10 flex items-center justify-center text-brown hover:bg-whitewash-off transition-colors text-lg"
          >
            +
          </button>
        </div>
        {selected && qty > 1 && (
          <p className="text-xs text-brown-light mt-1">
            {selected.stock_qty - qty < 5 && selected.stock_qty - qty > 0
              ? `Only ${selected.stock_qty - qty} left after this`
              : ''}
          </p>
        )}
      </div>

      {/* Dynamic CTA */}
      <button
        onClick={handleAddToCart}
        disabled={!selected || adding}
        className="w-full bg-brown text-whitewash font-medium py-4 rounded-full transition-colors hover:bg-brown-light disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {adding ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            Adding...
          </span>
        ) : added ? (
          '✓ Added to bag'
        ) : selected && total ? (
          qty > 1
            ? `Add ${qty} to bag — ${formatPrice(total)}`
            : `Add to bag — ${formatPrice(total)}`
        ) : (
          'Select a size'
        )}
      </button>
    </div>
  )
}
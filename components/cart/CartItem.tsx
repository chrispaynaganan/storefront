'use client'
import Image from 'next/image'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import type { CartItem as CartItemType } from '@/types'

export function CartItem({ item, onRemove }: { item: CartItemType; onRemove?: (id: string) => void }) {
  const product = item.variant?.product
  const variant = item.variant
  const [qty, setQty] = useState(item.qty)
  const [loading, setLoading] = useState(false)
  const { refreshCart } = useCart()

  async function updateQty(newQty: number) {
    if (newQty < 1) return remove()
    setLoading(true)
    setQty(newQty)
    const supabase = createClient()
    await supabase.from('cart_items').update({ qty: newQty }).eq('id', item.id)
    await refreshCart()
    setLoading(false)
  }

  async function remove() {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('cart_items').delete().eq('id', item.id)
    await refreshCart()
    onRemove?.(item.id)
    setLoading(false)
  }

  return (
    <div className="flex gap-4 py-5 border-b border-peach-light">
      <div className="relative w-24 h-24 bg-whitewash-off rounded-xl overflow-hidden shrink-0">
        {product?.image_urls?.[0] && (
          <Image src={product.image_urls[0]} alt={product.name ?? ''} fill className="object-cover" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex justify-between">
          <div>
            <p className="font-medium text-brown">{product?.name}</p>
            <p className="text-xs text-brown-light mt-0.5">Size: {variant?.size}</p>
          </div>
          <p className="font-medium text-brown">{formatPrice((variant?.price ?? 0) * qty)}</p>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center border border-peach-light rounded-lg overflow-hidden">
            <button onClick={() => updateQty(qty - 1)} disabled={loading}
              className="w-8 h-8 flex items-center justify-center text-brown hover:bg-whitewash-off transition-colors">−</button>
            <span className="w-8 text-center text-sm text-brown">{qty}</span>
            <button onClick={() => updateQty(qty + 1)} disabled={loading}
              className="w-8 h-8 flex items-center justify-center text-brown hover:bg-whitewash-off transition-colors">+</button>
          </div>
          <button onClick={remove} disabled={loading}
            className="text-xs text-brown-light hover:text-red-500 underline transition-colors">
            Remove
          </button>
        </div>
      </div>
    </div>
  )
}
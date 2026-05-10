'use client'
import { useState } from 'react'
import { ProductVariantSelector } from '@/components/products/ProductVariantSelector'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase'
import { useCart } from '@/context/CartContext'
import type { Variant } from '@/types'

interface Props { variants: Variant[]; productId: string }

export function AddToCartButton({ variants, productId }: Props) {
  const [selected, setSelected] = useState<Variant | null>(null)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const { refreshCart } = useCart()

  async function handleAddToCart() {
    if (!selected) return
    setAdding(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/login'
      return
    }

    const { error } = await supabase.from('cart_items').upsert({
      user_id: user.id,
      variant_id: selected.id,
      qty: 1,
    }, { onConflict: 'user_id,variant_id' })

    if (!error) {
      await refreshCart()
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    }
    setAdding(false)
  }

  return (
    <div className="mt-8 space-y-4">
      <ProductVariantSelector variants={variants} onSelect={setSelected} />
      <Button
        onClick={handleAddToCart}
        disabled={!selected || adding}
        size="lg"
        className="w-full bg-brown text-white hover:bg-brow py-4 rounded-full disabled:opacity-40"
      >
        {adding ? 'Adding...' : added ? '✓ Added to cart' : selected ? 'Add to cart' : 'Select a size'}
      </Button>
    </div>
  )
}
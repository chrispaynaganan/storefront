'use client'
import { useState } from 'react'
import { CartItem } from './CartItem'
import { CartSummary } from './CartSummary'
import { PromoCodeInput } from './PromoCodeInput'
import { EmptyState } from '@/components/ui/EmptyState'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function CartPageClient({ cartItems }: { cartItems: any[] }) {
  const [discount, setDiscount] = useState(0)
  const [promoCode, setPromoCode] = useState('')

  const subtotal = cartItems.reduce((sum, item) =>
    sum + (item.variant?.price ?? 0) * item.qty, 0)

  function handlePromoApply(amount: number, code: string) {
    setDiscount(amount)
    setPromoCode(code)
  }

  if (!cartItems.length) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-light text-[#3B1F0E] mb-8">Your cart</h1>
        <EmptyState
          message="Your cart is empty."
          action={
            <Link href="/products">
              <Button className="bg-[#3B1F0E] text-white hover:bg-[#6B3A22] px-6 py-2.5 rounded-lg mt-4">
                Shop now
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-light text-[#3B1F0E] mb-8">
        Your cart ({cartItems.length})
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {cartItems.map(item => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>
        <div className="space-y-4">
          <PromoCodeInput onApply={handlePromoApply} subtotal={subtotal} />
          <CartSummary subtotal={subtotal} discount={discount} />
        </div>
      </div>
    </div>
  )
}
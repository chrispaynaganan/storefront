'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { PayPalButton } from './PayPalButton'
import { PromoCodeInput } from '@/components/cart/PromoCodeInput'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/context/CartContext'
import Image from 'next/image'

interface Props {
  cartItems: any[]
  subtotal: number
  userId: string
}

export function CheckoutClient({ cartItems, subtotal, userId }: Props) {
  const router = useRouter()
  const { refreshCart } = useCart()
  const [form, setForm] = useState({
    full_name: '', line1: '', line2: '', city: '',
    province: '', country: 'Philippines', postal_code: '', phone: '',
  })
  const [formReady, setFormReady] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [promoCode, setPromoCode] = useState('')
  const [error, setError] = useState('')

  const total = Math.max(0, subtotal - discount)

  function updateForm(field: string, value: string) {
    const updated = { ...form, [field]: value }
    setForm(updated)
    const required = ['full_name', 'line1', 'city', 'province', 'postal_code']
    setFormReady(required.every(k => updated[k as keyof typeof updated].trim()))
  }

  function handlePromoApply(amount: number, code: string) {
    setDiscount(amount)
    setPromoCode(code)
  }

  async function handlePaymentSuccess(paypalOrderId: string) {
    const supabase = createClient()

    const { data: address } = await supabase
      .from('addresses')
      .insert({ user_id: userId, ...form, is_default: false })
      .select()
      .single()

    if (!address) { setError('Failed to save address'); return }

    const { data: order } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        address_id: address.id,
        status: 'paid',
        subtotal,
        discount,
        total,
        currency: 'PHP',
        paypal_order_id: paypalOrderId,
      })
      .select()
      .single()

    if (!order) { setError('Failed to create order'); return }

    await supabase.from('order_items').insert(
      cartItems.map(item => ({
        order_id: order.id,
        variant_id: item.variant_id,
        qty: item.qty,
        unit_price: item.variant?.price ?? 0,
        line_total: (item.variant?.price ?? 0) * item.qty,
      }))
    )

    for (const item of cartItems) {
      await supabase.rpc('decrement_stock', {
        p_variant_id: item.variant_id,
        p_qty: item.qty,
      })
    }

    await supabase.from('cart_items').delete().eq('user_id', userId)
    await refreshCart()

    router.push(`/order/${order.id}`)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-light text-brown mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Shipping form */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-brown">Shipping details</h2>
          <Input label="Full name" value={form.full_name} onChange={e => updateForm('full_name', e.target.value)} placeholder="Juan dela Cruz" />
          <Input label="Address line 1" value={form.line1} onChange={e => updateForm('line1', e.target.value)} placeholder="123 Main St" />
          <Input label="Address line 2 (optional)" value={form.line2} onChange={e => updateForm('line2', e.target.value)} placeholder="Apt, unit, etc." />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" value={form.city} onChange={e => updateForm('city', e.target.value)} placeholder="Manila" />
            <Input label="Province" value={form.province} onChange={e => updateForm('province', e.target.value)} placeholder="Metro Manila" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Postal code" value={form.postal_code} onChange={e => updateForm('postal_code', e.target.value)} placeholder="1000" />
            <Input label="Country" value={form.country} onChange={e => updateForm('country', e.target.value)} />
          </div>
          <Input label="Phone" value={form.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="+63 9XX XXX XXXX" />
        </div>

        {/* Order summary + PayPal */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-peach-light p-5">
            <h2 className="text-lg font-medium text-brown mb-4">Order summary</h2>
            <div className="space-y-3 mb-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 bg-whitewash-off rounded-lg overflow-hidden shrink-0">
                    {item.variant?.product?.image_urls?.[0] && (
                      <Image src={item.variant.product.image_urls[0]} alt="" fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-brown">{item.variant?.product?.name}</p>
                    <p className="text-xs text-brown-light">Size: {item.variant?.size} × {item.qty}</p>
                  </div>
                  <p className="text-sm text-brown">{formatPrice((item.variant?.price ?? 0) * item.qty)}</p>
                </div>
              ))}
            </div>

            {/* Promo code */}
            <div className="border-t border-peach-light pt-4 mb-4">
              <PromoCodeInput onApply={handlePromoApply} subtotal={subtotal} />
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t border-peach-light pt-3">
              <div className="flex justify-between text-sm text-brown/60">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount {promoCode && `(${promoCode})`}</span>
                  <span>− {formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-brown text-base pt-1">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-peach-light p-5">
            <h2 className="text-lg font-medium text-brown mb-4">Payment</h2>
            {!formReady ? (
              <p className="text-sm text-brown-light text-center py-4">
                Fill in your shipping details to continue
              </p>
            ) : (
              <PayPalButton amount={total} onSuccess={handlePaymentSuccess} />
            )}
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
        </div>

      </div>
    </div>
  )
}
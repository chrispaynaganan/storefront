import { formatPrice } from '@/lib/utils'
import type { CartItem } from '@/types'

interface Props { items: CartItem[]; subtotal: number; discount: number }

export function OrderSummary({ items, subtotal, discount }: Props) {
  return (
    <div className="bg-white rounded-xl border border-peach-light p-5">
      <h2 className="text-lg font-medium text-brown mb-4">Order summary</h2>
      <div className="space-y-2 mb-4">
        {items.map(item => (
          <div key={item.id} className="flex justify-between text-sm text-brown-light">
            <span>{item.variant?.product?.name} × {item.qty}</span>
            <span>{formatPrice((item.variant?.price ?? 0) * item.qty)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-peach-light pt-3 flex justify-between text-sm font-medium text-brown">
        <span>Total</span>
        <span>{formatPrice(subtotal - discount)}</span>
      </div>
    </div>
  )
}

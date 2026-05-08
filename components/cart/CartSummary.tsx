import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface Props { subtotal: number; discount: number }

export function CartSummary({ subtotal, discount }: Props) {
  const total = subtotal - discount
  return (
    <div className="bg-white rounded-xl border border-peach-light p-5 space-y-3">
      <p className="font-medium text-brown mb-2">Summary</p>
      <div className="flex justify-between text-sm text-brown-light">
        <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <span>Discount</span><span>-{formatPrice(discount)}</span>
        </div>
      )}
      <div className="flex justify-between text-sm font-medium text-brown border-t border-peach-light pt-3">
        <span>Total</span><span>{formatPrice(total)}</span>
      </div>
      <Link href="/checkout"><Button className="w-full" size="lg">Checkout</Button></Link>
    </div>
  )
}

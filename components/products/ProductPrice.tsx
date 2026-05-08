import { formatPrice } from '@/lib/utils'

interface Props { price: number; compareAtPrice?: number | null; currency?: string }

export function ProductPrice({ price, compareAtPrice, currency = 'PHP' }: Props) {
  const hasDiscount = compareAtPrice && compareAtPrice > price
  return (
    <div className="flex items-center gap-2 mt-1">
      <span className="text-sm font-medium text-brown">{formatPrice(price, currency)}</span>
      {hasDiscount && (
        <span className="text-xs text-brown-light line-through">{formatPrice(compareAtPrice, currency)}</span>
      )}
    </div>
  )
}

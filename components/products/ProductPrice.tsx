import { formatPrice } from '@/lib/utils'

interface Props {
  price: number
  compareAtPrice?: number | null
  currency?: string
}

export function ProductPrice({ price, compareAtPrice, currency = 'PHP' }: Props) {
  const hasDiscount = compareAtPrice && compareAtPrice > price
  const savings = hasDiscount ? compareAtPrice - price : 0

  return (
    <div className="flex items-center gap-3 mt-1">
      <span className="text-2xl font-semibold text-brown">
        {formatPrice(price, currency)}
      </span>
      {hasDiscount && (
        <span className="inline-flex items-center bg-whitewash-off text-brown-light text-xs font-medium px-3 py-1 rounded-full border border-peach-light">
          {formatPrice(compareAtPrice, currency)} · Save {formatPrice(savings, currency)}
        </span>
      )}
    </div>
  )
}
import Link from 'next/link'
import { ProductCard } from './ProductCard'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Product } from '@/types'

interface Props {
  products?: Product[]
  favoritedIds?: Set<string>
  emptyMessage?: string
  emptySubmessage?: string
  emptyHref?: string
  emptyActionLabel?: string
}

export function ProductGrid({
  products = [],
  favoritedIds,
  emptyMessage = 'No products found.',
  emptySubmessage = 'Check back soon — new pieces are on the way.',
  emptyHref = '/shop',
  emptyActionLabel = 'Browse all products',
}: Props) {
  if (products.length === 0) return (
    <EmptyState
      message={emptyMessage}
      submessage={emptySubmessage}
      action={
        <Link
          href={emptyHref}
          className="inline-block bg-brown text-whitewash text-sm font-semibold rounded-full px-8 py-3 hover:bg-brown-light transition-colors"
        >
          {emptyActionLabel}
        </Link>
      }
    />
  )

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} favoritedIds={favoritedIds} priority={i < 4} />
      ))}
    </div>
  )
}
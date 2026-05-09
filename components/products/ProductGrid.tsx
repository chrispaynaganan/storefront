import { ProductCard } from './ProductCard'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Product } from '@/types'

interface Props {
  products?: Product[]
  favoritedIds?: Set<string>
}

export function ProductGrid({ products = [], favoritedIds }: Props) {
  if (products.length === 0) return <EmptyState message="No products found." />
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(p => (
        <ProductCard key={p.id} product={p} favoritedIds={favoritedIds} />
      ))}
    </div>
  )
}
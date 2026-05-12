import Link from 'next/link'
import { ProductCard } from '@/components/products/ProductCard'
import type { Product } from '@/types'

interface Props {
  products: Product[]
}

export function FeaturedProducts({ products }: Props) {
  if (!products.length) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-brown-light mb-1 font-medium">Just Dropped</p>
          <h2 className="text-2xl font-light text-brown tracking-tight">New Arrivals</h2>
        </div>
        <Link href="/new" className="text-sm text-brown-light hover:text-brown transition-colors">
          View all new
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
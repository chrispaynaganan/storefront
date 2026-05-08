import Link from 'next/link'
import { ProductCard } from '@/components/products/ProductCard'
import type { Product } from '@/types'

interface Props { products?: Product[] }

export function BestsellerStrip({ products = [] }: Props) {
  return (
    <section className="bg-peach-light py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-light text-brown">Bestsellers</h2>
          <Link href="/products?filter=bestseller" className="text-sm text-brown-light hover:text-brown underline">View all</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}

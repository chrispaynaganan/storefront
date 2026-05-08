import { ProductGrid } from '@/components/products/ProductGrid'
import type { Product } from '@/types'

interface Props { products?: Product[] }

export function FeaturedProducts({ products = [] }: Props) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-2xl font-light text-brown mb-8">Featured products</h2>
      <ProductGrid products={products} />
    </section>
  )
}

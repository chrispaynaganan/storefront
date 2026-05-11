import { Suspense } from 'react'
import { ProductGrid } from '@/components/products/ProductGrid'
import { ProductFilters } from '@/components/products/ProductFilters'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getFavoritedProductIds } from '@/lib/favorites'

export const metadata = { title: 'All Products' }

interface Props {
  searchParams: Promise<{ q?: string; sizes?: string; in_stock?: string; sort?: string }>
}

export default async function ProductsPage({ searchParams }: Props) {
  const { q, sizes, in_stock, sort } = await searchParams
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('products')
    .select('*, variants(*), collection:collections(*)')
    .eq('is_active', true)

  if (q) query = query.ilike('name', `%${q}%`)

  // Size filter — filter products that have at least one variant with that size
  if (sizes) {
    const sizeList = sizes.split(',').filter(Boolean)
    if (sizeList.length > 0) {
      query = query.in('variants.size', sizeList)
    }
  }

  // In stock filter
  if (in_stock === 'true') {
    query = query.gt('variants.stock_qty', 0)
  }

  // Sort
  if (sort === 'price_asc') {
    query = query.order('variants(price)', { ascending: true })
  } else if (sort === 'price_desc') {
    query = query.order('variants(price)', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: products } = await query
  const favoritedIds = await getFavoritedProductIds()

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="text-3xl font-light text-brown">
          {q ? `Results for "${q}"` : 'All Products'}
        </h1>
        {q && (
          <a href="/products" className="text-sm text-brown-light hover:text-brown underline">
            Clear search
          </a>
        )}
      </div>
      <div className="flex gap-8">
        <Suspense>
          <ProductFilters />
        </Suspense>
        <div className="flex-1">
          <ProductGrid products={products ?? []} favoritedIds={favoritedIds} />
        </div>
      </div>
    </div>
  )
}
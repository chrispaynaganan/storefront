import { Suspense } from 'react'
import { ProductGrid } from '@/components/products/ProductGrid'
import { ProductFilters } from '@/components/products/ProductFilters'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getFavoritedProductIds } from '@/lib/favorites'

export const metadata = { title: 'Shop All — Known & Worn' }

interface Props {
  searchParams: Promise<{ q?: string; sizes?: string; in_stock?: string; sort?: string }>
}

export default async function ShopPage({ searchParams }: Props) {
  const { q, sizes, in_stock, sort } = await searchParams
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('products')
    .select('*, variants(*)')
    .eq('is_active', true)

  if (q) query = query.ilike('name', `%${q}%`)
  if (sizes) {
    const sizeList = sizes.split(',').filter(Boolean)
    if (sizeList.length > 0) query = query.in('variants.size', sizeList)
  }
  if (in_stock === 'true') query = query.gt('variants.stock_qty', 0)
  if (sort === 'price_asc') query = query.order('variants(price)', { ascending: true })
  else if (sort === 'price_desc') query = query.order('variants(price)', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  const { data: products } = await query
  const favoritedIds = await getFavoritedProductIds()

  return (
    <div>
      <div className="bg-whitewash-off border-b border-peach-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h1
            className="font-sans font-light text-brown leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.02em' }}
          >
            {q ? `Results for "${q}"` : 'Shop All'}
          </h1>
          <p className="text-brown-light text-sm sm:text-base mt-3 max-w-md font-light">
            The full Known & Worn collection.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8">
          <Suspense><ProductFilters /></Suspense>
          <div className="flex-1">
            <ProductGrid products={products ?? []} favoritedIds={favoritedIds} />
          </div>
        </div>
      </div>
    </div>
  )
}
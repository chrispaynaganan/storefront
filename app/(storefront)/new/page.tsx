import { Suspense } from 'react'
import { ProductGrid } from '@/components/products/ProductGrid'
import { ProductFilters } from '@/components/products/ProductFilters'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getFavoritedProductIds } from '@/lib/favorites'

export const metadata = { title: 'New Arrivals — Known & Worn' }

interface Props {
  searchParams: Promise<{ sizes?: string; in_stock?: string; sort?: string }>
}

export default async function NewArrivalsPage({ searchParams }: Props) {
  const { sizes, in_stock, sort } = await searchParams
  const supabase = await createServerSupabaseClient()

  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  let query = supabase
    .from('products')
    .select('*, variants(*)')
    .eq('is_active', true)
    .gte('created_at', since)

  if (sizes) {
    const sizeList = sizes.split(',').filter(Boolean)
    if (sizeList.length > 0) query = query.in('variants.size', sizeList)
  }

  if (in_stock === 'true') query = query.gt('variants.stock_qty', 0)

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
    <div>
      {/* Hero */}
      <div className="bg-whitewash-off border-b border-peach-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="text-xs tracking-[0.25em] uppercase text-brown-light mb-3 font-medium">
            Just Dropped
          </p>
          <h1
            className="font-sans font-light text-brown leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.02em' }}
          >
            New Arrivals
          </h1>
          <p className="text-brown-light text-sm sm:text-base mt-3 max-w-md font-light">
            The latest additions to the Known & Worn family. Added in the last 14 days.
          </p>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8">
          <Suspense>
            <ProductFilters />
          </Suspense>
          <div className="flex-1">
            {products?.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-brown/40 text-sm">No new arrivals right now. Check back soon.</p>
              </div>
            ) : (
              <ProductGrid products={products ?? []} favoritedIds={favoritedIds} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
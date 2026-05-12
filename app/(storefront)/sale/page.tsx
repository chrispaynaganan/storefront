import { Suspense } from 'react'
import { ProductGrid } from '@/components/products/ProductGrid'
import { ProductFilters } from '@/components/products/ProductFilters'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getFavoritedProductIds } from '@/lib/favorites'

export const metadata = { title: 'Sale — Known & Worn' }

interface Props {
  searchParams: Promise<{ sizes?: string; in_stock?: string; sort?: string }>
}

export default async function SalePage({ searchParams }: Props) {
  const { sizes, in_stock, sort } = await searchParams
  const supabase = await createServerSupabaseClient()

  // Get all variant IDs that have a compare_at_price (i.e. are on sale)
  const { data: saleVariants } = await supabase
    .from('variants')
    .select('product_id')
    .not('compare_at_price', 'is', null)

  const saleProductIds = [...new Set((saleVariants ?? []).map(v => v.product_id))]

  let products = null

  if (saleProductIds.length > 0) {
    let query = supabase
      .from('products')
      .select('*, variants(*)')
      .eq('is_active', true)
      .in('id', saleProductIds)

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

    const { data } = await query
    products = data
  }

  const favoritedIds = await getFavoritedProductIds()
  const isEmpty = !products || products.length === 0

  return (
    <div>
      {/* Hero */}
      <div className="bg-brown text-whitewash">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="text-xs tracking-[0.25em] uppercase text-peach/60 mb-3 font-medium">
            Limited Time
          </p>
          <h1
            className="font-sans font-light text-whitewash leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.02em' }}
          >
            Sale
          </h1>
          <p className="text-whitewash/60 text-sm sm:text-base mt-3 max-w-md font-light">
            Discounted styles — while stocks last.
          </p>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isEmpty ? (
          <div className="py-20 text-center">
            <p className="text-brown/40 text-sm">No sale items at the moment. Check back soon.</p>
          </div>
        ) : (
          <div className="flex gap-8">
            <Suspense>
              <ProductFilters />
            </Suspense>
            <div className="flex-1">
              <ProductGrid products={products ?? []} favoritedIds={favoritedIds} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
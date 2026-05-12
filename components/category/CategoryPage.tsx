import { Suspense } from 'react'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ProductGrid } from '@/components/products/ProductGrid'
import { ProductFilters } from '@/components/products/ProductFilters'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getFavoritedProductIds } from '@/lib/favorites'

interface CategoryConfig {
  slug: string
  label: string
  description: string
}

interface SearchParams {
  sizes?: string
  in_stock?: string
  sort?: string
}

export async function CategoryPage({
  config,
  searchParams,
}: {
  config: CategoryConfig
  searchParams: SearchParams
}) {
  const { sizes, in_stock, sort } = searchParams
  const supabase = await createServerSupabaseClient()

  // Look up the collection by slug
  const { data: collection } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', config.slug)
    .eq('is_active', true)
    .single()

  // Not found is non-fatal for category pages — we show empty grid, not 404
  // (collection may not be seeded yet)

  let query = supabase
    .from('products')
    .select('*, variants(*)')
    .eq('is_active', true)

  if (collection) {
    query = query.eq('collection_id', collection.id)
  } else {
    // No collection seeded yet — return nothing gracefully
    query = query.eq('id', '00000000-0000-0000-0000-000000000000')
  }

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

  const heroImage = collection?.image_url ?? null

  return (
    <div>
      {/* Hero */}
      <div
        className="relative w-full overflow-hidden flex items-end"
        style={{ minHeight: 'clamp(260px, 35vw, 420px)' }}
      >
        {/* Background */}
        {heroImage ? (
          <Image
            src={heroImage}
            alt={config.label}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-whitewash-off" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-brown/60 via-brown/10 to-transparent" />

        {/* Text */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
          <h1
            className="font-sans font-light text-whitewash leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.02em' }}
          >
            {config.label}
          </h1>
          <p className="text-whitewash/70 text-sm sm:text-base mt-2 max-w-md font-light">
            {config.description}
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
            <ProductGrid products={products ?? []} favoritedIds={favoritedIds} />
          </div>
        </div>
      </div>
    </div>
  )
}
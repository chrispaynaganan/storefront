import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ProductGrid } from '@/components/products/ProductGrid'
import { ProductFilters } from '@/components/products/ProductFilters'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getFavoritedProductIds } from '@/lib/favorites'

interface CategoryConfig {
  slug?: string
  label: string
  description: string
  audience?: string
  productType?: string
  backLink?: { label: string; href: string }
  shopLink?: string
  emptyMessage?: string
  emptySubmessage?: string
  emptyHref?: string
  emptyActionLabel?: string
}

interface SearchParams {
  sizes?: string
  in_stock?: string
  sort?: string
}

export async function CategoryPage({
  config,
  searchParams,
  newArrivalsOnly = false,
}: {
  config: CategoryConfig
  searchParams: SearchParams
  newArrivalsOnly?: boolean
}) {
  const { sizes, in_stock, sort } = searchParams
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('products')
    .select('*, variants(*)')
    .eq('is_active', true)

  if (config.audience) {
    query = query.eq('audience', config.audience)
  }

  if (config.productType) {
    query = query.eq('product_type', config.productType)
  }

  if (!config.audience && !config.productType && config.slug) {
    const { data: collection } = await supabase
      .from('collections')
      .select('id')
      .eq('slug', config.slug)
      .eq('is_active', true)
      .single()

    if (collection) {
      query = query.eq('collection_id', collection.id)
    } else {
      query = query.eq('id', '00000000-0000-0000-0000-000000000000')
    }
  }

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

  let heroImage: string | null = null
  if (config.slug) {
    const { data: collection } = await supabase
      .from('collections')
      .select('image_url')
      .eq('slug', config.slug)
      .single()
    heroImage = collection?.image_url ?? null
  }

  return (
    <div>
      {/* Hero */}
      <div
        className="relative w-full overflow-hidden flex items-end"
        style={{ minHeight: 'clamp(260px, 35vw, 420px)' }}
      >
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
        <div className="absolute inset-0 bg-linear-to-t from-brown/60 via-brown/10 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
          {config.backLink && (
            <div className="flex items-center gap-2 mb-3">
              <Link
                href={config.backLink.href}
                className="text-whitewash/60 text-xs hover:text-whitewash transition-colors"
              >
                {config.backLink.label}
              </Link>
              <span className="text-whitewash/40 text-xs">→</span>
              <span className="text-whitewash/80 text-xs">{config.label}</span>
            </div>
          )}
          <h1
            className="font-sans font-light text-whitewash leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.02em' }}
          >
            {config.label}
          </h1>
          <p className="text-whitewash/70 text-sm sm:text-base mt-2 max-w-md font-light">
            {config.description}
          </p>
          {config.shopLink && (
            <Link
              href={config.shopLink}
              className="inline-block mt-5 bg-whitewash text-brown text-sm font-medium rounded-full px-6 py-2.5 hover:bg-peach-light transition-colors"
            >
              Shop All →
            </Link>
          )}
        </div>
      </div>

      {/* Back link */}
      {config.backLink && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Link
            href={config.backLink.href}
            className="text-sm text-brown/50 hover:text-brown transition-colors"
          >
            ← {config.backLink.label}
          </Link>
        </div>
      )}

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8">
          <Suspense>
            <ProductFilters />
          </Suspense>
          <div className="flex-1">
            <ProductGrid
              products={products ?? []}
              favoritedIds={favoritedIds}
              emptyMessage={config.emptyMessage ?? 'No products found.'}
              emptySubmessage={config.emptySubmessage ?? 'Check back soon — new pieces are on the way.'}
              emptyHref={config.audience ? `/${config.audience}/shop` : '/shop'}
              emptyActionLabel={config.audience ? `Browse all ${config.label.split(' ')[0]} products` : 'Browse all products'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
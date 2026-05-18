import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ProductGrid } from '@/components/products/ProductGrid'
import { ProductFilters } from '@/components/products/ProductFilters'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getFavoritedProductIds } from '@/lib/favorites'
import { SITE_NAME, canonical, metaDesc } from '@/lib/seo'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sizes?: string; in_stock?: string; sort?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  const { data: collection } = await supabase
    .from('collections')
    .select('name, description, image_url')
    .eq('slug', slug)
    .single()

  if (!collection) return { title: 'Collection Not Found' }

  const title = `${collection.name} Collection — ${SITE_NAME}`
  const description = metaDesc(
    collection.description ??
      `Shop the ${collection.name} collection from ${SITE_NAME}. Filipino streetwear made in the Philippines.`
  )
  const url = canonical(`/collections/${slug}`)

  return {
    title,
    description,
    keywords: [collection.name, 'Filipino streetwear', 'Philippines collection', SITE_NAME],
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: SITE_NAME,
      images: collection.image_url
        ? [{ url: collection.image_url, width: 1200, height: 630, alt: collection.name }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: collection.image_url ? [collection.image_url] : undefined,
    },
  }
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { sizes, in_stock, sort } = await searchParams
  const supabase = await createServerSupabaseClient()

  const { data: collection } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!collection) notFound()

  let query = supabase
    .from('products')
    .select('*, variants(*)')
    .eq('is_active', true)
    .eq('collection_id', collection.id)

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
    <div className="max-w-7xl mx-auto px-4 py-10">
      <p className="text-xs text-brown-light uppercase tracking-widest mb-2">Collection</p>
      <h1 className="text-3xl font-light text-brown mb-2">{collection.name}</h1>
      {collection.description && (
        <p className="text-brown-light mb-10">{collection.description}</p>
      )}
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
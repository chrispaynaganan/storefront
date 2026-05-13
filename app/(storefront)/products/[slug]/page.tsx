import Link from 'next/link'
import { ProductImages } from '@/components/products/ProductImages'
import { ProductPrice } from '@/components/products/ProductPrice'
import { ProductBadge } from '@/components/products/ProductBadge'
import { FavoriteButton } from '@/components/products/FavoriteButton'
import { ShareButton } from '@/components/products/ShareButton'
import { ReviewSection } from '@/components/products/ReviewSection'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getFavoritedProductIds } from '@/lib/favorites'
import { notFound } from 'next/navigation'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

async function getProduct(slug: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, variants(*), collection:collections(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  if (error || !data) return null
  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return {}

  const lowestPrice = product.variants?.length
    ? Math.min(...product.variants.map((v: any) => v.price))
    : 0
  const image = product.image_urls?.[0]

  return {
    title: `${product.name} | Known & Worn`,
    description: product.description ?? `Shop ${product.name} at Known & Worn.`,
    openGraph: {
      title: product.name,
      description: product.description ?? `Shop ${product.name} at Known & Worn.`,
      images: image ? [{ url: image, width: 1200, height: 630, alt: product.name }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description ?? `Shop ${product.name} at Known & Worn.`,
      images: image ? [image] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const supabase = await createServerSupabaseClient()

  const lowestPrice = product.variants?.length
    ? Math.min(...product.variants.map((v: any) => v.price))
    : 0

  const highestCompare = product.variants?.length
    ? Math.max(...product.variants.map((v: any) => v.compare_at_price ?? 0))
    : null

  const favoritedIds = await getFavoritedProductIds()
  const isFavorited = favoritedIds.has(product.id)

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, user:users(full_name, avatar_url, email)')
    .eq('product_id', product.id)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? '',
    image: product.image_urls ?? [],
    brand: { '@type': 'Brand', name: 'Known & Worn' },
    offers: product.variants?.map((v: any) => ({
      '@type': 'Offer',
      price: v.price,
      priceCurrency: 'PHP',
      availability: v.stock_qty > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      sku: v.sku,
    })),
  }

  // Favorite + Share actions — shared between image overlay (mobile) and info column (md+)
  const actions = (
    <div className="flex items-center gap-2">
      <FavoriteButton
        productId={product.id}
        initialFavorited={isFavorited}
        size="lg"
      />
      <ShareButton title={product.name} />
    </div>
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-brown-light mb-6 md:mb-8">
          <Link href="/" className="hover:text-brown transition-colors">Home</Link>
          <span className="text-brown-light/40">/</span>
          {product.collection ? (
            <>
              <Link
                href={`/collections/${product.collection.slug}`}
                className="hover:text-brown transition-colors"
              >
                {product.collection.name}
              </Link>
              <span className="text-brown-light/40">/</span>
            </>
          ) : (
            <>
              <Link href="/products" className="hover:text-brown transition-colors">Products</Link>
              <span className="text-brown-light/40">/</span>
            </>
          )}
          <span className="text-brown font-medium">{product.name}</span>
        </nav>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">

          {/* LEFT — images (actions overlay on mobile via prop) */}
          <ProductImages
            images={product.image_urls ?? []}
            name={product.name}
            overlayActions={actions}
          />

          {/* RIGHT — product info */}
          <div>

            {/* Actions row — visible on md+, hidden on mobile (shown in image overlay) */}
            <div className="hidden md:flex justify-end mb-4">
              {actions}
            </div>

            {/* Collection / category tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {product.collection && (
                <Link
                  href={`/collections/${product.collection.slug}`}
                  className="inline-block text-xs text-brown border border-peach rounded-full px-3 py-1 hover:bg-peach-light/30 transition-colors"
                >
                  {product.collection.name}
                </Link>
              )}
              {product.tags?.map((tag: string) => (
                <span
                  key={tag}
                  className="inline-block text-xs text-brown-light border border-peach-light rounded-full px-3 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Product name + badge */}
            <div className="flex items-start gap-3 flex-wrap">
              <h1 className="text-3xl font-semibold text-brown leading-tight">
                {product.name}
              </h1>
              {product.is_bestseller && <ProductBadge label="Bestseller" />}
            </div>

            {/* Price */}
            <ProductPrice
              price={lowestPrice}
              compareAtPrice={
                highestCompare && highestCompare > lowestPrice ? highestCompare : null
              }
            />

            {/* Variant selector + qty + CTAs + description — all in one client component */}
            <AddToCartButton
              variants={product.variants ?? []}
              productId={product.id}
              description={product.description ?? null}
            />
          </div>
        </div>

        {/* Reviews */}
        <ReviewSection
          productId={product.id}
          initialReviews={reviews ?? []}
          currentUserId={currentUser?.id ?? null}
        />

      </div>
    </>
  )
}
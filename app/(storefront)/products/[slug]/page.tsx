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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-brown-light mb-8">
          <Link href="/" className="hover:text-brown">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-brown">Products</Link>
          <span>/</span>
          <span className="text-brown">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <ProductImages images={product.image_urls ?? []} name={product.name} />

          <div>
            {product.collection && (
              <Link
                href={`/collections/${product.collection.slug}`}
                className="text-xs text-brown-light uppercase tracking-widest hover:text-brown"
              >
                {product.collection.name}
              </Link>
            )}

            {/* Title row */}
            <div className="flex items-start justify-between mt-2 mb-3 gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-light text-brown">{product.name}</h1>
                {product.is_bestseller && <ProductBadge label="Bestseller" />}
              </div>
              <div className="flex items-center gap-2 shrink-0 mt-1">
                <FavoriteButton
                  productId={product.id}
                  initialFavorited={isFavorited}
                  size="lg"
                />
                <ShareButton title={product.name} />
              </div>
            </div>

            <ProductPrice
              price={lowestPrice}
              compareAtPrice={highestCompare && highestCompare > lowestPrice ? highestCompare : null}
            />

            {product.description && (
              <p className="text-brown-light text-sm leading-relaxed mt-4">
                {product.description}
              </p>
            )}

            <AddToCartButton variants={product.variants ?? []} productId={product.id} />
          </div>
        </div>

        <ReviewSection
          productId={product.id}
          initialReviews={reviews ?? []}
          currentUserId={currentUser?.id ?? null}
        />

      </div>
    </>
  )
}
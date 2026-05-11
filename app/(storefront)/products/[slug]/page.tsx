import { ProductImages } from '@/components/products/ProductImages'
import { ProductVariantSelector } from '@/components/products/ProductVariantSelector'
import { ProductPrice } from '@/components/products/ProductPrice'
import { ProductBadge } from '@/components/products/ProductBadge'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import type { Metadata } from 'next'

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  const { data: product } = await supabase
    .from('products')
    .select('*, variants(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) return {}

  const lowestPrice = product.variants?.length
    ? Math.min(...product.variants.map((v: any) => v.price))
    : 0
  const image = product.image_urls?.[0]

  return {
    title: `${product.name} — Known & Worn`,
    description: product.description ?? `Shop ${product.name} at Known & Worn. Clean, expressive streetwear built for everyday wear.`,
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
  const supabase = await createServerSupabaseClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, variants(*), collection:collections(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  const lowestPrice = product.variants?.length
    ? Math.min(...product.variants.map((v: any) => v.price))
    : 0
  const highestCompare = product.variants?.length
    ? Math.max(...product.variants.map((v: any) => v.compare_at_price ?? 0))
    : null

  // Structured data for Google
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
      availability: v.stock_qty > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
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
        <nav className="flex items-center gap-2 text-xs text-brown-light mb-8">
          <a href="/" className="hover:text-brown">Home</a>
          <span>/</span>
          <a href="/products" className="hover:text-brown">Products</a>
          <span>/</span>
          <span className="text-brown">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <ProductImages images={product.image_urls ?? []} name={product.name} />

          <div>
            {product.collection && (
              <a href={`/collections/${product.collection.slug}`}
                className="text-xs text-brown-light uppercase tracking-widest hover:text-brown">
                {product.collection.name}
              </a>
            )}
            <div className="flex items-center gap-3 mt-2 mb-3">
              <h1 className="text-3xl font-light text-brown">{product.name}</h1>
              {product.is_bestseller && <ProductBadge label="Bestseller" />}
            </div>

            <ProductPrice
              price={lowestPrice}
              compareAtPrice={highestCompare && highestCompare > lowestPrice ? highestCompare : null}
            />

            {product.description && (
              <p className="text-brown-light text-sm leading-relaxed mt-4">{product.description}</p>
            )}

            <AddToCartButton variants={product.variants ?? []} productId={product.id} />
          </div>
        </div>
      </div>
    </>
  )
}
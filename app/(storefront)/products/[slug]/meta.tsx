import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { SITE_NAME, SITE_URL, canonical, metaDesc } from '@/lib/seo'

// ─── Types (matches your schema) ─────────────
interface Variant {
  price: number
  compare_at_price: number | null
  stock_qty: number
  size: string
  color: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  image_urls: string[]
  collection_id: string | null
  audience: string
  product_type: string
  is_bestseller: boolean
  variants: Variant[]
}

async function getProduct(slug: string): Promise<Product | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('products')
    .select('*, variants(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data ?? null
}

// ─── generateMetadata ────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Product Not Found' }

  const title = `${product.name} — ${SITE_NAME}`
  const description = metaDesc(
    product.description ||
      `Shop ${product.name} — clean, expressive streetwear made in the Philippines.`
  )
  const image = product.image_urls?.[0] ?? ''
  const url = canonical(`/products/${slug}`)

  const minPrice = product.variants?.length
    ? Math.min(...product.variants.map(v => v.price))
    : null

  const inStock = product.variants?.some(v => v.stock_qty > 0)

  return {
    title,
    description,
    keywords: [
      product.name,
      product.product_type,
      product.audience,
      'Filipino streetwear',
      'Philippines apparel',
      SITE_NAME,
    ].filter(Boolean),
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      images: image
        ? [{ url: image, width: 1200, height: 1200, alt: product.name }]
        : undefined,
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
    other: minPrice
      ? {
          'product:price:amount': String(minPrice),
          'product:price:currency': 'PHP',
          'product:availability': inStock ? 'in stock' : 'out of stock',
          'product:brand': SITE_NAME,
        }
      : {},
  }
}

// ─── JSON-LD structured data helper ──────────
export function ProductJsonLd({ product }: { product: Product }) {
  const minPrice = product.variants?.length
    ? Math.min(...product.variants.map(v => v.price))
    : 0
  const maxPrice = product.variants?.length
    ? Math.max(...product.variants.map(v => v.price))
    : 0
  const inStock = product.variants?.some(v => v.stock_qty > 0)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: metaDesc(product.description ?? '', 300),
    image: product.image_urls ?? [],
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    url: canonical(`/products/${product.slug}`),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'PHP',
      lowPrice: minPrice,
      highPrice: maxPrice,
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
      },
    },
    ...(product.is_bestseller && {
      additionalProperty: {
        '@type': 'PropertyValue',
        name: 'isBestseller',
        value: true,
      },
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// ─── Usage in your existing product page ─────
//
// 1. Export generateMetadata from this file (already done above)
//    OR copy it directly into app/(storefront)/products/[slug]/page.tsx
//
// 2. In your page component's <head> area, add:
//    <ProductJsonLd product={product} />
//
// Your existing page.tsx should look like:
//
// export { generateMetadata } from './meta'  ← if you keep this separate
//
// export default async function ProductPage({ params }) {
//   const product = await getProduct(params.slug)
//   if (!product) notFound()
//   return (
//     <>
//       <ProductJsonLd product={product} />
//       {/* ...your existing JSX... */}
//     </>
//   )
// }
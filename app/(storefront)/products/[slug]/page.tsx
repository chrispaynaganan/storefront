import { ProductImages } from '@/components/products/ProductImages'
import { ProductVariantSelector } from '@/components/products/ProductVariantSelector'
import { ProductPrice } from '@/components/products/ProductPrice'
import { ProductBadge } from '@/components/products/ProductBadge'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { AddToCartButton } from '@/components/cart/AddToCartButton'

interface Props { params: Promise<{ slug: string }> }

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#6B3A22] mb-8">
        <a href="/" className="hover:text-[#3B1F0E]">Home</a>
        <span>/</span>
        <a href="/products" className="hover:text-[#3B1F0E]">Products</a>
        <span>/</span>
        <span className="text-[#3B1F0E]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <ProductImages images={product.image_urls ?? []} name={product.name} />

        <div>
          {product.collection && (
            <a href={`/collections/${product.collection.slug}`}
              className="text-xs text-[#6B3A22] uppercase tracking-widest hover:text-[#3B1F0E]">
              {product.collection.name}
            </a>
          )}
          <div className="flex items-center gap-3 mt-2 mb-3">
            <h1 className="text-3xl font-light text-[#3B1F0E]">{product.name}</h1>
            {product.is_bestseller && <ProductBadge label="Bestseller" />}
          </div>

          <ProductPrice
            price={lowestPrice}
            compareAtPrice={highestCompare && highestCompare > lowestPrice ? highestCompare : null}
          />

          {product.description && (
            <p className="text-[#6B3A22] text-sm leading-relaxed mt-4">{product.description}</p>
          )}

          <AddToCartButton variants={product.variants ?? []} productId={product.id} />
        </div>
      </div>
    </div>
  )
}
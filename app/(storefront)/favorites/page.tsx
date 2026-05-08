import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { ProductCard } from '@/components/products/ProductCard'
import type { Product } from '@/types'

export default async function FavoritesPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: favorites } = await supabase
    .from('favorites')
    .select(`
      product_id,
      products (
        id, name, slug, description, image_urls,
        is_bestseller, is_active, collection_id, created_at,
        variants (
          id, product_id, size, color, stock_qty,
          price, compare_at_price, sku
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const products = (favorites ?? [])
    .map((f: any) => f.products as Product)
    .filter(Boolean)

  const favoritedIds = new Set(products.map((p) => p.id))

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-light text-[#3B1F0E] mb-8">Favorites</h1>
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[#F0EAE4] flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-[#AAAAAA]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </div>
          <h2 className="text-xl text-[#3B1F0E] mb-2">Nothing saved yet</h2>
          <p className="text-sm text-[#999] max-w-xs mb-8">
            When you find something you love, tap the heart to save it here.
          </p>
          <a
            href="/products"
            className="inline-block bg-[#3B1F0E] text-[#FAF7F4] text-sm font-medium rounded-full px-8 py-3 hover:bg-[#5a3020] transition-colors"
          >
            Start shopping
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              favoritedIds={favoritedIds}
            />
          ))}
        </div>
      )}
    </div>
  )
}
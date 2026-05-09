import { ProductGrid } from '@/components/products/ProductGrid'
import { ProductFilters } from '@/components/products/ProductFilters'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getFavoritedProductIds } from '@/lib/favorites'

export const metadata = { title: 'All Products' }

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function ProductsPage({ searchParams }: Props) {
  const { q } = await searchParams
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('products')
    .select('*, variants(*), collection:collections(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  const { data: products } = await query
  const favoritedIds = await getFavoritedProductIds()

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="text-3xl font-light text-brown">
          {q ? `Results for "${q}"` : 'All Products'}
        </h1>
        {q && (
          <a href="/products" className="text-sm text-brown-light hover:text-brown underline">
            Clear search
          </a>
        )}
      </div>
      <div className="flex gap-8">
        <ProductFilters />
        <div className="flex-1">
          <ProductGrid products={products ?? []} favoritedIds={favoritedIds} />
        </div>
      </div>
    </div>
  )
}
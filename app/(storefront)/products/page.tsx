import { ProductGrid } from '@/components/products/ProductGrid'
import { ProductFilters } from '@/components/products/ProductFilters'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const metadata = { title: 'All Products' }

export default async function ProductsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: products } = await supabase
    .from('products')
    .select('*, variants(*), collection:collections(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-light text-[#3B1F0E] mb-8">All Products</h1>
      <div className="flex gap-8">
        <ProductFilters />
        <div className="flex-1">
          <ProductGrid products={products ?? []} />
        </div>
      </div>
    </div>
  )
}
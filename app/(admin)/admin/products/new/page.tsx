import { ProductForm } from '@/components/admin/ProductForm'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const metadata = { title: 'Add Product — Admin' }

export default async function AdminNewProductPage() {
  const supabase = await createServerSupabaseClient()
  const { data: collections } = await supabase
    .from('collections')
    .select('id, name')
    .eq('is_active', true)

  return (
    <div>
      <h1 className="text-2xl font-light text-brown mb-8">Add product</h1>
      <ProductForm collections={collections ?? []} />
    </div>
  )
}
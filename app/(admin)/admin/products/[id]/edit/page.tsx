import { ProductForm } from '@/components/admin/ProductForm'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'

interface Props { params: Promise<{ id: string }> }

export default async function AdminEditProductPage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, variants(*)')
    .eq('id', id)
    .single()

  if (!product) notFound()

  const { data: collections } = await supabase
    .from('collections')
    .select('id, name')
    .eq('is_active', true)

  return (
    <div>
      <h1 className="text-2xl font-light text-brown mb-8">Edit — {product.name}</h1>
      <ProductForm productId={id} initialData={product} collections={collections ?? []} />
    </div>
  )
}
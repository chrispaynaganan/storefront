import { ProductGrid } from '@/components/products/ProductGrid'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'

interface Props { params: Promise<{ slug: string }> }

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  const { data: collection } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!collection) notFound()

  const { data: products } = await supabase
    .from('products')
    .select('*, variants(*)')
    .eq('is_active', true)
    .eq('collection_id', collection.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <p className="text-xs text-[#6B3A22] uppercase tracking-widest mb-2">Collection</p>
      <h1 className="text-3xl font-light text-[#3B1F0E] mb-2">{collection.name}</h1>
      {collection.description && (
        <p className="text-[#6B3A22] mb-10">{collection.description}</p>
      )}
      <ProductGrid products={products ?? []} />
    </div>
  )
}
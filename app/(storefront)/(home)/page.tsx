import { HeroBanner } from '@/components/home/HeroBanner'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { CollectionsGrid } from '@/components/home/CollectionsGrid'
import { BestsellerStrip } from '@/components/home/BestsellerStrip'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()

  const { data: collections } = await supabase
    .from('collections')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  const { data: bestsellers } = await supabase
    .from('products')
    .select('*, variants(*)')
    .eq('is_active', true)
    .eq('is_bestseller', true)
    .limit(4)

  const { data: featured } = await supabase
    .from('products')
    .select('*, variants(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <>
      <HeroBanner />
      <CollectionsGrid collections={collections ?? []} />
      <BestsellerStrip products={bestsellers ?? []} />
      <FeaturedProducts products={featured ?? []} />
    </>
  )
}

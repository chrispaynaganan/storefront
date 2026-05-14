import { HeroBanner } from '@/components/home/HeroBanner'
import { CollectionsGrid } from '@/components/home/CollectionsGrid'
import { BestsellerStrip } from '@/components/home/BestsellerStrip'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { SaleBanner } from '@/components/home/SaleBanner'
import { BrandStatement } from '@/components/home/BrandStatement'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()

  const [
    { data: collections },
    { data: bestsellers },
    { data: featured },
    { data: saleVariants },
  ] = await Promise.all([
    supabase
      .from('collections')
      .select('*')
      .eq('is_active', true)
      .order('sort_order'),

    supabase
      .from('products')
      .select('*, variants(*)')
      .eq('is_active', true)
      .eq('is_bestseller', true)
      .limit(4),

    supabase
      .from('products')
      .select('*, variants(*)')
      .eq('is_active', true)
      .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(8),

    supabase
      .from('variants')
      .select('id')
      .not('compare_at_price', 'is', null)
      .limit(1),
  ])

  const hasSale = (saleVariants?.length ?? 0) > 0

  return (
    <>
      <SaleBanner isActive={hasSale} />
      <HeroBanner />
      <FeaturedProducts products={featured ?? []} />
      <CollectionsGrid collections={collections ?? []} />
      <BestsellerStrip products={bestsellers ?? []} />
      <BrandStatement />
    </>
  )
}
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { SITE_NAME, canonical, metaDesc } from '@/lib/seo'

async function getCollection(slug: string) {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return data ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const collection = await getCollection(slug)
  if (!collection) return { title: 'Collection Not Found' }

  const title = `${collection.name} Collection — ${SITE_NAME}`
  const description = metaDesc(
    collection.description ||
      `Shop the ${collection.name} collection from ${SITE_NAME}. Filipino streetwear made for everyday wear.`
  )
  const url = canonical(`/collections/${slug}`)
  const image = collection.image_url ?? ''

  return {
    title,
    description,
    keywords: [collection.name, 'Filipino streetwear', 'Philippines collection', SITE_NAME],
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      images: image ? [{ url: image, width: 1200, height: 630, alt: collection.name }] : undefined,
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

// ─── Usage ────────────────────────────────────
// In app/(storefront)/collections/[slug]/page.tsx add:
//
// export { generateMetadata } from './meta'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PageBlocksRenderer } from '@/components/cms/PageBlocksRenderer'
import { SITE_NAME, canonical, metaDesc } from '@/lib/seo'
import type { Block } from '@/types/cms'

interface Props {
  params: Promise<{ slug: string }>
}

async function getPage(slug: string) {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('site_pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  return data ?? null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return { title: 'Page Not Found' }

  const title = `${page.title} — ${SITE_NAME}`
  const url = canonical(`/pages/${slug}`)

  return {
    title,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title,
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary',
      title,
    },
  }
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-semibold text-brown mb-10">{page.title}</h1>
      <PageBlocksRenderer blocks={page.blocks as Block[]} />
    </div>
  )
}
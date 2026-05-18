import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { SITE_NAME, SITE_URL, canonical, metaDesc } from '@/lib/seo'

async function getPost(slug: string) {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('journal_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  return data ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Post Not Found' }

  const title = `${post.title} — ${SITE_NAME} Journal`
  const description = metaDesc(post.excerpt || post.content || '')
  const url = canonical(`/journal/${slug}`)
  const image = post.cover_image_url ?? ''

  return {
    title,
    description,
    keywords: [post.category, 'Known and Worn journal', 'Filipino fashion', SITE_NAME].filter(Boolean),
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      section: post.category,
      authors: [SITE_URL],
      images: image
        ? [{ url: image, width: 1200, height: 630, alt: post.title }]
        : undefined,
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

// ─── Article JSON-LD ─────────────────────────
export function ArticleJsonLd({ post }: { post: {
  title: string
  slug: string
  excerpt?: string
  content?: string
  cover_image_url?: string
  published_at?: string
  updated_at?: string
  category?: string
}}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: metaDesc(post.excerpt || post.content || '', 300),
    image: post.cover_image_url ? [post.cover_image_url] : undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical(`/journal/${post.slug}`),
    },
    articleSection: post.category,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// ─── Usage ────────────────────────────────────
// In app/(storefront)/journal/[slug]/page.tsx:
//
// export { generateMetadata } from './meta'
//
// export default async function JournalPostPage({ params }) {
//   const post = await getPost(params.slug)
//   if (!post) notFound()
//   return (
//     <>
//       <ArticleJsonLd post={post} />
//       {/* ...your existing JSX... */}
//     </>
//   )
// }
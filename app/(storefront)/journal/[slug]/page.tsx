import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { SITE_NAME, SITE_URL, canonical, metaDesc } from '@/lib/seo'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  const { data: post } = await supabase
    .from('journal_posts')
    .select('title, excerpt, content, cover_image_url, published_at, updated_at, category')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!post) return { title: 'Post Not Found' }

  const title = `${post.title} — ${SITE_NAME} Journal`
  const description = metaDesc(post.excerpt || post.content || '')
  const url = canonical(`/journal/${slug}`)

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
      siteName: SITE_NAME,
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      section: post.category,
      authors: [SITE_URL],
      images: post.cover_image_url
        ? [{ url: post.cover_image_url, width: 1200, height: 630, alt: post.title }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  }
}

export default async function JournalArticlePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()

  const { data: post } = await supabase
    .from('journal_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!post) notFound()

  const articleJsonLd = {
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
      '@id': canonical(`/journal/${slug}`),
    },
    articleSection: post.category,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div className="max-w-2xl mx-auto px-4 py-16">
        <Link
          href="/journal"
          className="text-xs text-brown-light uppercase tracking-widest hover:text-brown transition-colors mb-8 inline-block"
        >
          ← Journal
        </Link>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4">
          {post.category && (
            <span className="text-xs text-brown-light uppercase tracking-widest">{post.category}</span>
          )}
          {post.category && post.published_at && <span className="text-brown/20">·</span>}
          {post.published_at && (
            <span className="text-xs text-brown-light">
              {new Date(post.published_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
        </div>

        <h1 className="text-4xl font-light text-brown leading-tight mb-8">
          {post.title}
        </h1>

        {/* Cover image */}
        {post.cover_image_url && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-10 bg-whitewash-off">
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
            />
          </div>
        )}

        {/* Content */}
        {post.content && (
          <div
            className="prose prose-sm max-w-none prose-headings:font-medium prose-headings:text-brown prose-p:text-brown-light prose-p:leading-relaxed prose-li:text-brown-light prose-strong:text-brown"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}

        <div className="border-t border-peach-light pt-10 mt-12">
          <Link
            href="/journal"
            className="text-sm text-brown underline hover:text-brown-light transition-colors"
          >
            ← Back to Journal
          </Link>
        </div>
      </div>
    </>
  )
}
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase-server'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  const { data: post } = await supabase
    .from('journal_posts')
    .select('title')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  if (!post) return {}
  return { title: `${post.title} — Known & Worn` }
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

  return (
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
            {new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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

      {/* Content rendered from Tiptap HTML */}
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
  )
}
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const metadata: Metadata = { title: 'Journal — Known & Worn' }

export default async function JournalPage() {
  const supabase = await createServerSupabaseClient()

  const { data: posts } = await supabase
    .from('journal_posts')
    .select('id, title, slug, excerpt, category, cover_image_url, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  return (
    <div>
      {/* Hero */}
      <div className="bg-whitewash-off border-b border-peach-light">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="text-xs tracking-[0.25em] uppercase text-brown-light mb-3 font-medium">Editorial</p>
          <h1
            className="font-sans font-light text-brown leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.02em' }}
          >
            Journal
          </h1>
          <p className="text-brown-light text-sm sm:text-base mt-3 max-w-md font-light">
            Thoughts on craft, style, and what it means to dress with intention.
          </p>
        </div>
      </div>

      {/* Articles */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {(!posts || posts.length === 0) ? (
          <div className="py-20 text-center">
            <p className="text-brown/40 text-sm">No posts yet. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/journal/${post.slug}`}
                className="group flex gap-6 border-b border-peach-light py-8 first:pt-0"
              >
                {/* Cover image */}
                {post.cover_image_url && (
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden shrink-0 bg-whitewash-off">
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>
                )}

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {post.category && (
                      <span className="text-xs text-brown-light uppercase tracking-widest">{post.category}</span>
                    )}
                    {post.category && post.published_at && <span className="text-brown/20">·</span>}
                    {post.published_at && (
                      <span className="text-xs text-brown-light">
                        {new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-medium text-brown mb-1 group-hover:text-brown-light transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-brown-light leading-relaxed line-clamp-2">{post.excerpt}</p>
                  )}
                </div>

                <span className="text-brown/30 group-hover:text-brown transition-colors shrink-0 self-center">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
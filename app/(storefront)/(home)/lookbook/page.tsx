import type { Metadata } from 'next'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const metadata: Metadata = { title: 'Lookbook — Known & Worn' }

export default async function LookbookPage() {
  const supabase = await createServerSupabaseClient()
  const { data: photos } = await supabase
    .from('lookbook_photos')
    .select('id, image_url, title, caption')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return (
    <div>
      {/* Hero */}
      <div className="bg-whitewash-off border-b border-peach-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="text-xs tracking-[0.25em] uppercase text-brown-light mb-3 font-medium">
            Editorial
          </p>
          <h1
            className="font-sans font-light text-brown leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.02em' }}
          >
            Lookbook
          </h1>
          <p className="text-brown-light text-sm sm:text-base mt-3 max-w-md font-light">
            How the pieces actually look. Real wear, honest styling.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!photos || photos.length === 0 ? (
          <div className="text-center py-24 text-brown/30 text-sm">
            Coming soon — check back shortly.
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {photos.map(photo => (
              <div key={photo.id} className="break-inside-avoid rounded-2xl overflow-hidden bg-whitewash-off">
                <img
                  src={photo.image_url}
                  alt={photo.title ?? 'Lookbook photo'}
                  className="w-full object-cover"
                />
                {(photo.title || photo.caption) && (
                  <div className="px-4 py-3">
                    {photo.title && <p className="text-sm font-semibold text-brown">{photo.title}</p>}
                    {photo.caption && <p className="text-xs text-brown/50 mt-0.5">{photo.caption}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="border-t border-peach-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-brown-light text-sm mb-4">Ready to shop the looks?</p>
          <Link
            href="/shop"
            className="inline-block bg-brown text-whitewash text-sm font-medium rounded-full px-8 py-3 hover:bg-brown-light transition-colors"
          >
            Shop All
          </Link>
        </div>
      </div>
    </div>
  )
}
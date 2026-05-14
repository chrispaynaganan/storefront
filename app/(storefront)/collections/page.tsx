import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const metadata = { title: 'Collections — Known & Worn' }

export default async function CollectionsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: collections } = await supabase
    .from('collections')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  return (
    <div>
      {/* Hero */}
      <div className="bg-whitewash-off border-b border-peach-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="text-xs tracking-[0.25em] uppercase text-brown-light mb-3 font-medium">
            Known & Worn
          </p>
          <h1
            className="font-sans font-light text-brown leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.02em' }}
          >
            Collections
          </h1>
          <p className="text-brown-light text-sm sm:text-base mt-3 max-w-md font-light">
            Every drop, every season. Browse the full collection.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {(!collections || collections.length === 0) ? (
          <div className="py-20 text-center">
            <p className="text-brown/40 text-sm">No collections yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((c) => (
              <Link
                key={c.id}
                href={`/collections/${c.slug}`}
                className="group flex flex-col"
              >
                {/* Image */}
                <div
                  className="relative w-full overflow-hidden bg-whitewash-off"
                  style={{ aspectRatio: '4/3', borderRadius: '1rem' }}
                >
                  {c.image_url ? (
                    <Image
                      src={c.image_url}
                      alt={c.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(160deg, #FFCBA4 0%, #E8A882 100%)', borderRadius: '1rem' }}
                    />
                  )}
                </div>

                {/* Label */}
                <div className="mt-3 px-0.5">
                  <p className="text-base font-medium text-brown leading-tight">
                    {c.name}
                  </p>
                  {c.description && (
                    <p className="text-sm text-brown/50 mt-0.5 line-clamp-1">
                      {c.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
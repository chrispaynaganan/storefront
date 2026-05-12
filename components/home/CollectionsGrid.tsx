import Link from 'next/link'
import Image from 'next/image'

const CATEGORIES = [
  { label: 'Women',  href: '/women',  description: 'Shop Women' },
  { label: 'Men',    href: '/men',    description: 'Shop Men' },
  { label: 'Kids',   href: '/kids',   description: 'Shop Kids' },
  { label: 'Sports', href: '/sports', description: 'Active & Sport' },
]

interface Collection {
  id: string
  name: string
  slug: string
  image_url: string | null
}

interface Props {
  collections: Collection[]
}

export function CollectionsGrid({ collections }: Props) {
  // Map seeded collections by slug for image lookups
  const bySlug = Object.fromEntries(collections.map(c => [c.slug, c]))

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-end justify-between mb-8">
        <h2 className="text-2xl font-light text-brown tracking-tight">Shop by Category</h2>
        <Link href="/products" className="text-sm text-brown-light hover:text-brown transition-colors">
          View all
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {CATEGORIES.map(({ label, href, description }) => {
          const slug = label.toLowerCase()
          const collection = bySlug[slug]
          const imageUrl = collection?.image_url ?? null

          return (
            <Link
              key={label}
              href={href}
              className="group relative aspect-3/4 bg-whitewash-off rounded-2xl overflow-hidden block"
            >
              {/* Image */}
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={label}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                /* Placeholder gradient when no image */
                <div
                  className="absolute inset-0"
                  style={{
                    background: slug === 'women'
                      ? 'linear-gradient(160deg, #FFCBA4 0%, #E8A882 100%)'
                      : slug === 'men'
                      ? 'linear-gradient(160deg, #6B3A22 0%, #3B1F0E 100%)'
                      : slug === 'kids'
                      ? 'linear-gradient(160deg, #FFE8D6 0%, #FFCBA4 100%)'
                      : 'linear-gradient(160deg, #3B1F0E 0%, #6B3A22 100%)',
                  }}
                />
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-brown/70 via-transparent to-transparent" />

              {/* Text */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                <p className="text-whitewash font-semibold text-base sm:text-lg leading-tight">{label}</p>
                <p className="text-whitewash/70 text-xs mt-0.5 group-hover:text-whitewash transition-colors">
                  {description} →
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
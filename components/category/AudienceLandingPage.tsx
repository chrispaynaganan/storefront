import Image from 'next/image'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getFavoritedProductIds } from '@/lib/favorites'
import { ProductCard } from '@/components/products/ProductCard'

const PRODUCT_TYPES = [
  { label: 'Shirts',   slug: 'shirts' },
  { label: 'Hoodies',  slug: 'hoodies' },
]

interface AudienceConfig {
  audience: string
  label: string
  description: string
  tagline: string
}

export async function AudienceLandingPage({ config }: { config: AudienceConfig }) {
  const supabase = await createServerSupabaseClient()

  // Hero image from collection
  const { data: collection } = await supabase
    .from('collections')
    .select('image_url')
    .eq('slug', config.audience)
    .single()

  // Featured products — latest 8 for this audience
  const { data: products } = await supabase
    .from('products')
    .select('*, variants(*)')
    .eq('is_active', true)
    .eq('audience', config.audience)
    .order('created_at', { ascending: false })
    .limit(8)

  const favoritedIds = await getFavoritedProductIds()
  const heroImage = collection?.image_url ?? null

  return (
    <div>
      {/* Hero */}
      <div
        className="relative w-full overflow-hidden flex items-end"
        style={{ minHeight: 'clamp(360px, 50vw, 600px)' }}
      >
        {heroImage ? (
          <Image
            src={heroImage}
            alt={config.label}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-whitewash-off" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-brown/70 via-brown/20 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 w-full">
          <p className="text-whitewash/60 text-xs tracking-[0.25em] uppercase mb-3 font-medium">
            {config.tagline}
          </p>
          <h1
            className="font-sans font-light text-whitewash leading-tight mb-4"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-0.02em' }}
          >
            {config.label}
          </h1>
          <p className="text-whitewash/70 text-sm sm:text-base max-w-md font-light mb-6">
            {config.description}
          </p>
          <Link
            href={`/${config.audience}/shop`}
            className="inline-block bg-whitewash text-brown text-sm font-semibold rounded-full px-8 py-3 hover:bg-peach-light transition-colors"
          >
            Shop All {config.label}'s
          </Link>
        </div>
      </div>

      {/* Shop by type */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-light text-brown">Shop by Type</h2>
        </div>
        <div className="flex gap-3 flex-wrap">
          {PRODUCT_TYPES.map(({ label, slug }) => (
            <Link
              key={slug}
              href={`/${config.audience}/${slug}`}
              className="px-5 py-2.5 rounded-full border border-peach text-sm text-brown font-medium hover:border-brown hover:bg-whitewash-off transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Featured products */}
      {(products ?? []).length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-light text-brown">Featured</h2>
            <Link
              href={`/${config.audience}/shop`}
              className="text-sm text-brown-light hover:text-brown underline transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(products ?? []).map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                favoritedIds={favoritedIds}
                priority={i < 4}
              />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href={`/${config.audience}/shop`}
              className="inline-block bg-brown text-whitewash text-sm font-semibold rounded-full px-10 py-3.5 hover:bg-brown-light transition-colors"
            >
              Shop All {config.label}'s
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
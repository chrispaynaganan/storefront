'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const CATEGORIES = [
  { label: 'Women',        slug: 'women',        href: '/women',        fallbackDescription: 'Dress with intention.' },
  { label: 'Men',          slug: 'men',          href: '/men',          fallbackDescription: 'Built for everyday.' },
  { label: 'Kids',         slug: 'kids',         href: '/kids',         fallbackDescription: 'Small fits, big heart.' },
  { label: 'Sports',       slug: 'sports',       href: '/sports',       fallbackDescription: 'Move by faith.' },
  { label: 'New Arrivals', slug: 'new-arrivals', href: '/new-arrivals', fallbackDescription: 'Just dropped.' },
  { label: 'Best Sellers', slug: 'best-sellers', href: '/best-sellers', fallbackDescription: 'Most loved.' },
]

const FALLBACK_GRADIENTS: Record<string, string> = {
  women:          'linear-gradient(160deg, #FFE8D6 0%, #FFCBA4 100%)',
  men:            'linear-gradient(160deg, #6B3A22 0%, #3B1F0E 100%)',
  kids:           'linear-gradient(160deg, #FFCBA4 0%, #FFE8D6 100%)',
  sports:         'linear-gradient(160deg, #3B1F0E 0%, #6B3A22 100%)',
  'new-arrivals': 'linear-gradient(160deg, #FFCBA4 0%, #E8A882 100%)',
  'best-sellers': 'linear-gradient(160deg, #3B1F0E 0%, #6B3A22 100%)',
}

interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
}

interface Props {
  collections: Collection[]
}

export function CollectionsGrid({ collections }: Props) {
  const bySlug = Object.fromEntries(collections.map(c => [c.slug, c]))
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateArrows = () => {
    const track = trackRef.current
    if (!track) return
    setCanScrollLeft(track.scrollLeft > 4)
    setCanScrollRight(track.scrollLeft < track.scrollWidth - track.clientWidth - 4)
  }

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    updateArrows()
    track.addEventListener('scroll', updateArrows, { passive: true })
    window.addEventListener('resize', updateArrows)
    return () => {
      track.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
    }
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector('[data-card]') as HTMLElement | null
    const amount = card ? card.offsetWidth + 16 : 300
    track.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <section className="py-10 sm:py-14 lg:py-16">

      {/* Heading + arrows */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-brown">
          Shop by Categories
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
            className="w-10 h-10 rounded-full border border-brown/20 flex items-center justify-center text-brown transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:border-brown/50 hover:bg-brown/5"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right"
            className="w-10 h-10 rounded-full border border-brown/20 flex items-center justify-center text-brown transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:border-brown/50 hover:bg-brown/5"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Scrollable track */}
      <div className="px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex-none w-4 sm:w-6 lg:w-8" aria-hidden="true" />

          {CATEGORIES.map(({ label, slug, href, fallbackDescription }, i) => {
            const collection = bySlug[slug]
            const imageUrl = collection?.image_url ?? null
            const description = collection?.description ?? fallbackDescription

            return (
              <Link
                key={slug}
                href={href}
                data-card
                className="group flex-none flex flex-col"
                style={{
                  width: 'clamp(200px, 72vw, 420px)',
                  scrollSnapAlign: 'start',
                }}
              >
                {/* Image card */}
                <div
                  className="relative w-full overflow-hidden bg-whitewash-off"
                  style={{ aspectRatio: '3/4', borderRadius: '1rem' }}
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={label}
                      fill
                      sizes="(max-width: 640px) 72vw, (max-width: 1024px) 40vw, 420px"
                      priority={i < 2}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ borderRadius: '1rem' }}
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: FALLBACK_GRADIENTS[slug],
                        borderRadius: '1rem',
                      }}
                    />
                  )}
                </div>

                {/* Label + tagline */}
                <div className="mt-3">
                  <p className="text-lg font-medium text-brown leading-tight">{label}</p>
                  <p className="text-sm mt-0.5" style={{ color: '#3B1F0E99' }}>{description}</p>
                </div>
              </Link>
            )
          })}

          <div className="flex-none w-4 sm:w-6 lg:w-8" aria-hidden="true" />
        </div>
      </div>

    </section>
  )
}
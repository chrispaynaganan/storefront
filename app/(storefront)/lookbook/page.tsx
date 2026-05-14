import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Lookbook — Known & Worn' }

// Replace these placeholder images with real lookbook photography
const LOOKBOOK_IMAGES = [
  { id: 1, alt: 'Lookbook image 1 — replace with real photo', aspectRatio: '3/4' },
  { id: 2, alt: 'Lookbook image 2 — replace with real photo', aspectRatio: '3/4' },
  { id: 3, alt: 'Lookbook image 3 — replace with real photo', aspectRatio: '4/3' },
  { id: 4, alt: 'Lookbook image 4 — replace with real photo', aspectRatio: '3/4' },
  { id: 5, alt: 'Lookbook image 5 — replace with real photo', aspectRatio: '3/4' },
  { id: 6, alt: 'Lookbook image 6 — replace with real photo', aspectRatio: '4/3' },
]

export default function LookbookPage() {
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

      {/* Image grid — replace bg-whitewash-off placeholders with real Image components */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {LOOKBOOK_IMAGES.map(({ id, alt, aspectRatio }) => (
            <div
              key={id}
              className="break-inside-avoid bg-whitewash-off rounded-2xl overflow-hidden"
              style={{ aspectRatio }}
            >
              {/* TODO: Replace with real image
              <Image src="/lookbook/image-1.jpg" alt={alt} fill className="object-cover" />
              */}
              <div className="w-full h-full flex items-center justify-center p-6 min-h-[200px]">
                <p className="text-xs text-brown/30 text-center leading-relaxed">{alt}</p>
              </div>
            </div>
          ))}
        </div>
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
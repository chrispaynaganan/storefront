'use client'
import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'

interface Props { images: string[]; name?: string }

export function ProductImages({ images, name = '' }: Props) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const prev = useCallback(() => setActive(i => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setActive(i => (i + 1) % images.length), [images.length])

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (!lightbox) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') setLightbox(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, prev, next])

  // Prevent body scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightbox ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightbox])

  function onTouchStart(e: React.TouchEvent) {
    setTouchStart(e.touches[0].clientX)
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart === null) return
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
    setTouchStart(null)
  }

  if (!images.length) return null

  return (
    <>
      {/* Main image */}
      <div className="space-y-3">
        <div
          className="relative aspect-square bg-whitewash-off rounded-2xl overflow-hidden cursor-zoom-in"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={() => setLightbox(true)}
        >
          <Image
            src={images[active]}
            alt={name}
            fill
            className="object-cover transition-opacity duration-300"
            priority
          />

          {/* Prev/Next arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev() }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-brown hover:bg-white transition-colors shadow-sm"
                aria-label="Previous image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={e => { e.stopPropagation(); next() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-brown hover:bg-white transition-colors shadow-sm"
                aria-label="Next image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Dot indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={e => { e.stopPropagation(); setActive(i) }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === active ? 'bg-brown w-3' : 'bg-brown/30'}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Zoom hint */}
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-brown/60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors shrink-0 ${
                  i === active ? 'border-brown' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Close */}
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {active + 1} / {images.length}
          </div>

          {/* Image */}
          <div
            className="relative w-full max-w-3xl max-h-[85vh] aspect-square mx-4"
            onClick={e => e.stopPropagation()}
          >
            <Image
              src={images[active]}
              alt={name}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Prev/Next */}
          {images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Previous"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={e => { e.stopPropagation(); next() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Next"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setActive(i) }}
                  className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    i === active ? 'border-white' : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
'use client'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

export function HeroBanner() {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const els = [headingRef.current, subRef.current, ctaRef.current]
    els.forEach((el, i) => {
      if (!el) return
      el.style.opacity = '0'
      el.style.transform = 'translateY(24px)'
      el.style.transition = `opacity 0.8s ease ${i * 0.15 + 0.2}s, transform 0.8s ease ${i * 0.15 + 0.2}s`
      requestAnimationFrame(() => {
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
      })
    })
  }, [])

  return (
    <section className="relative w-full overflow-hidden bg-whitewash-off" style={{ minHeight: 'min(90vh, 700px)' }}>

      {/* Background — editorial grain overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #FAF7F4 0%, #F2EDE8 40%, #FFCBA4 100%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />

      {/* Decorative circle */}
      <div
        className="absolute rounded-full bg-peach opacity-20"
        style={{
          width: 'clamp(300px, 50vw, 700px)',
          height: 'clamp(300px, 50vw, 700px)',
          right: '-10%',
          top: '-20%',
        }}
      />
      <div
        className="absolute rounded-full bg-peach-dark opacity-10"
        style={{
          width: 'clamp(200px, 30vw, 400px)',
          height: 'clamp(200px, 30vw, 400px)',
          right: '5%',
          bottom: '-10%',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center h-full"
        style={{ minHeight: 'min(90vh, 700px)', paddingTop: '80px', paddingBottom: '80px' }}
      >
        <div className="max-w-2xl">

          {/* Eyebrow */}
          <p className="text-xs tracking-[0.25em] uppercase text-brown-light mb-6 font-medium">
            New Collection
          </p>

          {/* Heading */}
          <h1
            ref={headingRef}
            className="font-sans text-brown leading-[1.05] mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 300, letterSpacing: '-0.02em' }}
          >
            Wear What
            <br />
            <span style={{ fontWeight: 600 }}>You Know.</span>
          </h1>

          {/* Subtext */}
          <p
            ref={subRef}
            className="text-brown-light text-base sm:text-lg font-light leading-relaxed mb-10 max-w-md"
          >
            Everyday essentials built for comfort, crafted with intent. Hoodies and shirts made to last.
          </p>

          {/* CTAs */}
          <div ref={ctaRef} className="flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-brown text-whitewash px-7 py-3.5 rounded-full text-sm font-medium hover:bg-brown-light transition-colors duration-200"
            >
              Shop Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/new"
              className="inline-flex items-center gap-2 border border-brown text-brown px-7 py-3.5 rounded-full text-sm font-medium hover:bg-brown hover:text-whitewash transition-colors duration-200"
            >
              New Arrivals
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #FAF7F4)' }}
      />
    </section>
  )
}
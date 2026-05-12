import Link from 'next/link'

export function BrandStatement() {
  return (
    <section className="bg-brown text-whitewash py-20 sm:py-28 overflow-hidden relative">

      {/* Decorative circle */}
      <div
        className="absolute rounded-full opacity-10"
        style={{
          width: 'clamp(300px, 60vw, 800px)',
          height: 'clamp(300px, 60vw, 800px)',
          background: '#FFCBA4',
          right: '-15%',
          top: '-30%',
          pointerEvents: 'none',
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs tracking-[0.25em] uppercase text-peach/60 mb-6 font-medium">Our Story</p>
        <h2
          className="font-sans font-light text-whitewash leading-[1.1] mb-8"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.02em' }}
        >
          Made for the ones
          <br />
          <span className="font-semibold text-peach">who know themselves.</span>
        </h2>
        <p className="text-whitewash/60 text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-10 font-light">
          Known & Worn is a Philippines-based clothing brand building essentials that move with you — from the streets to the everyday.
        </p>
        <Link
          href="/about"
          className="inline-flex items-center gap-2 border border-whitewash/30 text-whitewash px-7 py-3.5 rounded-full text-sm font-medium hover:bg-whitewash/10 transition-colors duration-200"
        >
          About the brand
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Journal — Known & Worn' }

// Replace with real articles when ready
const ARTICLES = [
  {
    slug: 'why-heavyweight-cotton',
    title: 'Why we use heavyweight cotton',
    date: 'May 2025',
    excerpt: 'Most brands use 160gsm. We use 280gsm. Here\'s why the difference matters more than you think.',
    category: 'Craft',
  },
  {
    slug: 'building-a-repeat-wear-wardrobe',
    title: 'Building a repeat-wear wardrobe',
    date: 'April 2025',
    excerpt: 'The pieces you reach for again and again have something in common. It\'s not trend. It\'s not price. It\'s fit and feel.',
    category: 'Style',
  },
  {
    slug: 'known-and-worn-story',
    title: 'How Known & Worn started',
    date: 'March 2025',
    excerpt: 'A Philippines-based brand built for everyday expression. This is where it came from.',
    category: 'Brand',
  },
]

export default function JournalPage() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-whitewash-off border-b border-peach-light">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="text-xs tracking-[0.25em] uppercase text-brown-light mb-3 font-medium">
            Editorial
          </p>
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
        <div className="space-y-0">
          {ARTICLES.map((article, i) => (
            <Link
              key={article.slug}
              href={`/journal/${article.slug}`}
              className="group block border-b border-peach-light py-8 first:pt-0"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs text-brown-light uppercase tracking-widest">{article.category}</span>
                    <span className="text-brown/20">·</span>
                    <span className="text-xs text-brown-light">{article.date}</span>
                  </div>
                  <h2 className="text-lg font-medium text-brown mb-2 group-hover:text-brown-light transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-sm text-brown-light leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
                <span className="text-brown/30 group-hover:text-brown transition-colors shrink-0 mt-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
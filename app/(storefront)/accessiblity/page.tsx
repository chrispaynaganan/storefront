import type { Metadata } from 'next'
import Link from 'next/link'
import { accessibilityMetadata } from '@/lib/static-metadata'
 
export const metadata = accessibilityMetadata

export default function AccessibilityPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <p className="text-xs text-brown-light uppercase tracking-widest mb-4">Legal</p>
      <h1 className="text-4xl font-light text-brown mb-6">Accessibility</h1>
      <p className="text-brown-light leading-relaxed mb-12">
        Known & Worn is committed to making our website accessible to everyone, regardless of ability or technology.
      </p>

      <section className="mb-12">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-6">Our commitment</h2>
        <div className="space-y-3 text-sm text-brown-light leading-relaxed">
          <p>We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. These guidelines explain how to make web content more accessible to people with disabilities.</p>
          <p>We are continuously working to improve the accessibility of our site and ensure all users can shop, read, and navigate without barriers.</p>
        </div>
      </section>

      <section className="mb-12 border-t border-peach-light pt-10">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-6">What we do</h2>
        <ul className="space-y-3 text-sm text-brown-light">
          {[
            'Semantic HTML for screen reader compatibility',
            'Sufficient color contrast across text and backgrounds',
            'Keyboard navigation support',
            'Alt text on all product and content images',
            'Focus indicators on interactive elements',
            'Responsive layout that works across screen sizes',
          ].map(item => (
            <li key={item} className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-brown-light shrink-0 mt-2" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-peach-light pt-10">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-4">Report an issue</h2>
        <p className="text-sm text-brown-light leading-relaxed mb-4">
          If you encounter any accessibility barriers on our site, please let us know. We take all feedback seriously and will work to address issues promptly.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-brown text-whitewash text-sm font-medium rounded-full px-8 py-3 hover:bg-brown-light transition-colors"
        >
          Contact us
        </Link>
      </section>
    </div>
  )
}
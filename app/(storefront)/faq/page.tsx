import type { Metadata } from 'next'
import Link from 'next/link'
import { faqMetadata } from '@/lib/static-metadata'
 
export const metadata = faqMetadata

const FAQS = [
  {
    section: 'Orders',
    items: [
      {
        q: 'How do I place an order?',
        a: 'Browse the site, select your size and color, and add to cart. When you\'re ready, head to checkout and complete payment via PayPal.',
      },
      {
        q: 'Can I modify or cancel my order?',
        a: 'Orders can be modified or cancelled within 24 hours of placing them. Contact us at mark.payns@gmail.com as soon as possible.',
      },
      {
        q: 'Do I need an account to order?',
        a: 'Yes — an account lets us track your orders and save your details for future purchases.',
      },
    ],
  },
  {
    section: 'Shipping',
    items: [
      {
        q: 'Where do you ship?',
        a: 'We ship nationwide across the Philippines and internationally. Shipping rates and delivery times are calculated at checkout.',
      },
      {
        q: 'How long does delivery take?',
        a: 'Metro Manila: 2–4 business days. Provincial (Luzon): 3–6 days. Visayas & Mindanao: 5–8 days. International: 7–21 days.',
      },
      {
        q: 'How do I track my order?',
        a: 'Once your order ships, you\'ll receive a tracking number via email. You can also check your order status under My Orders in your account.',
      },
    ],
  },
  {
    section: 'Returns & Exchanges',
    items: [
      {
        q: 'What is your return policy?',
        a: 'Returns are accepted within 7 days of receiving your order. Items must be unused, unwashed, and in original condition with tags attached.',
      },
      {
        q: 'How do I start a return?',
        a: 'Email mark.payns@gmail.com with your order number and reason for return. We\'ll guide you through the process.',
      },
      {
        q: 'Can I exchange for a different size?',
        a: 'Yes — size exchanges are available subject to stock. First-order size exchanges are free.',
      },
    ],
  },
  {
    section: 'Products',
    items: [
      {
        q: 'How do your sizes fit?',
        a: 'Our pieces are designed with a relaxed, oversized fit. Check the fit guide for measurements before ordering.',
      },
      {
        q: 'How should I care for my clothes?',
        a: 'Machine wash cold, inside out, on a gentle cycle. Tumble dry low or air dry. Do not bleach. See the care guide for full details.',
      },
      {
        q: 'Are your products made in the Philippines?',
        a: 'Yes — Known & Worn is a Philippines-based brand. All pieces are produced locally.',
      },
    ],
  },
  {
    section: 'Payments',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept PayPal and major credit/debit cards via PayPal checkout. All prices are in Philippine Peso (PHP).',
      },
      {
        q: 'Is my payment information secure?',
        a: 'Yes — all payments are processed securely through PayPal. We never store your card details.',
      },
      {
        q: 'Do you offer promo codes?',
        a: 'Yes — enter your promo code at checkout. Follow us on social media or sign up for updates to get access to exclusive codes.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <p className="text-xs text-brown-light uppercase tracking-widest mb-4">Support</p>
      <h1 className="text-4xl font-light text-brown mb-6">Frequently Asked Questions</h1>
      <p className="text-brown-light leading-relaxed mb-12">
        Can't find what you're looking for?{' '}
        <Link href="/contact" className="text-brown underline">Contact us</Link> and we'll get back to you.
      </p>

      <div className="space-y-12">
        {FAQS.map(({ section, items }) => (
          <div key={section}>
            <h2 className="text-xs text-brown-light uppercase tracking-widest mb-6">{section}</h2>
            <div className="space-y-6">
              {items.map(({ q, a }) => (
                <div key={q} className="border-t border-peach-light pt-5">
                  <p className="text-sm font-medium text-brown mb-2">{q}</p>
                  <p className="text-sm text-brown-light leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-peach-light pt-10 mt-12">
        <p className="text-sm text-brown-light mb-4">Still have questions?</p>
        <Link
          href="/contact"
          className="inline-block bg-brown text-whitewash text-sm font-medium rounded-full px-8 py-3 hover:bg-brown-light transition-colors"
        >
          Get in touch
        </Link>
      </div>
    </div>
  )
}
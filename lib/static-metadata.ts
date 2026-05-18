import type { Metadata } from 'next'
import { SITE_NAME, canonical, metaDesc } from '@/lib/seo'

// ─────────────────────────────────────────────
// Reusable metadata builder for static pages.
// Import and call this at the top of each static page.tsx
// ─────────────────────────────────────────────

interface StaticPageMeta {
  title: string
  description: string
  path: string
  keywords?: string[]
  noIndex?: boolean
}

export function buildStaticMetadata({
  title,
  description,
  path,
  keywords = [],
  noIndex = false,
}: StaticPageMeta): Metadata {
  const fullTitle = `${title} — ${SITE_NAME}`
  const desc = metaDesc(description)
  const url = canonical(path)

  return {
    title: fullTitle,
    description: desc,
    keywords: [...keywords, SITE_NAME, 'Filipino streetwear'],
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'website',
      url,
      title: fullTitle,
      description: desc,
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary',
      title: fullTitle,
      description: desc,
    },
  }
}

// ─────────────────────────────────────────────
// Pre-built metadata for every static page.
// Copy the relevant export into the matching page.tsx file.
// ─────────────────────────────────────────────

export const aboutMetadata = buildStaticMetadata({
  title: 'About',
  description: 'Known & Worn is a Philippines-based streetwear brand built around clean design, honest materials, and everyday wear.',
  path: '/about',
  keywords: ['about Known and Worn', 'Filipino brand story', 'Philippines streetwear brand'],
})

export const faqMetadata = buildStaticMetadata({
  title: 'FAQ',
  description: 'Answers to your most common questions about ordering, shipping, sizing, and returns at Known & Worn.',
  path: '/faq',
  keywords: ['Known and Worn FAQ', 'shipping questions', 'sizing help'],
})

export const shippingMetadata = buildStaticMetadata({
  title: 'Shipping',
  description: 'Known & Worn ships nationwide across the Philippines. Learn about our delivery times, fees, and couriers.',
  path: '/shipping',
  keywords: ['Known and Worn shipping', 'Philippines delivery', 'shipping policy'],
})

export const returnsMetadata = buildStaticMetadata({
  title: 'Returns & Exchanges',
  description: 'Learn about Known & Worn\'s return and exchange policy. We accept returns within 14 days of delivery.',
  path: '/returns',
  keywords: ['Known and Worn returns', 'exchange policy', 'return policy'],
})

export const fitGuideMetadata = buildStaticMetadata({
  title: 'Fit Guide',
  description: 'Not sure what size to get? Use our fit guide to find the perfect size for hoodies, shirts, and sports wear.',
  path: '/fit-guide',
  keywords: ['Known and Worn size guide', 'hoodie sizing', 'shirt sizing Philippines'],
})

export const careGuideMetadata = buildStaticMetadata({
  title: 'Care Guide',
  description: 'Keep your Known & Worn pieces looking their best. Washing, drying, and storage tips for every garment.',
  path: '/care-guide',
  keywords: ['garment care', 'how to wash hoodies', 'clothing care guide'],
})

export const materialsMetadata = buildStaticMetadata({
  title: 'Our Materials',
  description: 'Every Known & Worn piece is made from carefully selected fabrics. Learn about the materials behind our garments.',
  path: '/materials',
  keywords: ['Known and Worn materials', 'fabric quality', 'garment materials Philippines'],
})

export const printingMetadata = buildStaticMetadata({
  title: 'Printing Process',
  description: 'Learn how Known & Worn brings its graphics to life — our printing techniques, quality standards, and process.',
  path: '/printing-process',
  keywords: ['Known and Worn printing', 'garment printing Philippines', 'streetwear printing process'],
})

export const contactMetadata = buildStaticMetadata({
  title: 'Contact Us',
  description: 'Get in touch with Known & Worn. We\'d love to hear from you — questions, feedback, or collabs.',
  path: '/contact',
  keywords: ['contact Known and Worn', 'customer support Philippines'],
})

export const privacyMetadata = buildStaticMetadata({
  title: 'Privacy Policy',
  description: 'Read the Known & Worn privacy policy to understand how we collect, use, and protect your information.',
  path: '/privacy',
  noIndex: false,
})

export const termsMetadata = buildStaticMetadata({
  title: 'Terms of Service',
  description: 'Review the Known & Worn terms of service before using our website or placing an order.',
  path: '/terms',
  noIndex: false,
})

export const accessibilityMetadata = buildStaticMetadata({
  title: 'Accessibility',
  description: 'Known & Worn is committed to making our website accessible and usable for everyone.',
  path: '/accessibility',
})

export const trackOrderMetadata = buildStaticMetadata({
  title: 'Track Your Order',
  description: 'Track the status and delivery of your Known & Worn order.',
  path: '/track-order',
  keywords: ['track order', 'order status Philippines'],
})

// ─────────────────────────────────────────────
// HOW TO USE IN EACH STATIC PAGE:
//
// In app/(storefront)/about/page.tsx:
//   import { aboutMetadata } from '@/lib/static-metadata'
//   export const metadata = aboutMetadata
//   export default function AboutPage() { ...your existing JSX... }
//
// In app/(storefront)/faq/page.tsx:
//   import { faqMetadata } from '@/lib/static-metadata'
//   export const metadata = faqMetadata
//
// ...and so on for each page.
// ─────────────────────────────────────────────
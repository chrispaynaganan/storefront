import { SITE_NAME, SITE_URL } from '@/lib/seo'

/**
 * Organization + WebSite JSON-LD
 * Drop this component into your root app/layout.tsx inside <body>
 * It tells Google about your brand, social profiles, and enables Sitelinks Search Box.
 *
 * Usage in app/layout.tsx:
 *   import { OrganizationJsonLd } from '@/components/seo/OrganizationJsonLd'
 *   ...
 *   <body>
 *     <OrganizationJsonLd />
 *     {children}
 *   </body>
 */
export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/logo.png`,
          width: 200,
          height: 60,
        },
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'mark.payns@gmail.com',
          contactType: 'customer service',
          areaServed: 'PH',
          availableLanguage: ['English', 'Filipino'],
        },
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'PH',
        },
        sameAs: [
          'https://www.facebook.com/profile.php?id=61570705350137',
          // Add Instagram, TikTok, Shopee, Lazada URLs when ready
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: 'Clean, expressive streetwear made in the Philippines.',
        publisher: { '@id': `${SITE_URL}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
        inLanguage: 'en-PH',
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
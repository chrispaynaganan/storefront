import type { Metadata, Viewport } from 'next'
import { Gelasio } from 'next/font/google'
import './globals.css'
import {
  SITE_NAME,
  SITE_URL,
  SITE_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_KEYWORDS,
} from '@/lib/seo'
import { OrganizationJsonLd } from '@/components/seo/OrganizationJsonLd'

const gelasio = Gelasio({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-gelasio',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#FFCBA4',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: `${SITE_NAME} — Filipino Streetwear`,
    template: `%s | ${SITE_NAME}`,
  },

  description: SITE_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

  alternates: {
    canonical: '/',
  },

  openGraph: {
    type: 'website',
    locale: 'en_PH',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Filipino Streetwear`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Clean, expressive streetwear made in the Philippines`,
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Filipino Streetwear`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  icons: {
  icon: '/favicon.ico',
},

}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-PH" className={gelasio.variable}>
      <body className="font-sans bg-whitewash text-brown antialiased">
        <OrganizationJsonLd />
        {children}
      </body>
    </html>
  )
}
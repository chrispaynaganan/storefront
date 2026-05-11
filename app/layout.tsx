import type { Metadata } from 'next'
import { Quicksand } from 'next/font/google'
import './globals.css'

const quicksand = Quicksand({
  subsets: ['latin'],
  variable: '--font-quicksand',
})

export const metadata: Metadata = {
  title: 'Known & Worn',
  description: 'Clean, expressive streetwear. Built for everyday expression, made in the Philippines.',
  openGraph: {
    siteName: 'Known & Worn',
    type: 'website',
    locale: 'en_PH',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${quicksand.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}
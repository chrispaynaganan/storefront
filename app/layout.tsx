import type { Metadata } from 'next'
import { Quicksand } from 'next/font/google'
import './globals.css'

const quicksand = Quicksand({ subsets: ['latin'], variable: '--font-quicksand' })

export const metadata: Metadata = {
  title: { default: 'Known&Worn', template: '%s | Known&Worn' },
  description: 'Premium hoodies and shirts',
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
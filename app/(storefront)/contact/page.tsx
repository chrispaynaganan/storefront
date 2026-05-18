import Link from 'next/link'
import { contactMetadata } from '@/lib/static-metadata'
import { getSectionContent } from '@/lib/sections'

export const metadata = contactMetadata

export default async function ContactPage() {
  const content = await getSectionContent('contact', {
    heading: 'Get in touch',
    subheading: "We'd love to hear from you.",
    email: 'mark.payns@gmail.com',
  })

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <p className="text-xs text-brown-light uppercase tracking-widest mb-3">Contact</p>
      <h1 className="text-4xl font-light text-brown mb-3">{content.heading}</h1>
      {content.subheading && (
        <p className="text-brown-light mb-10">{content.subheading}</p>
      )}
      <div className="border border-peach-light rounded-2xl p-6 bg-white">
        <p className="text-sm text-brown-light mb-1">Email us at</p>
        <Link
          href={`mailto:${content.email}`}
          className="text-lg font-medium text-brown hover:text-brown-light transition-colors"
        >
          {content.email}
        </Link>
      </div>
    </div>
  )
}
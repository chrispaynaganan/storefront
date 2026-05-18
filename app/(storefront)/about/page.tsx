import Image from 'next/image'
import { aboutMetadata } from '@/lib/static-metadata'
import { getSectionContent } from '@/lib/sections'

export const metadata = aboutMetadata

export default async function AboutPage() {
  const content = await getSectionContent('about', {
    heading: 'About Known & Worn',
    body: '<p>Known & Worn is a Philippines-based apparel brand built around clean design and honest materials.</p>',
    image_url: '',
  })

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <p className="text-xs text-brown-light uppercase tracking-widest mb-3">About</p>
      <h1 className="text-4xl font-light text-brown mb-10">{content.heading}</h1>

      {content.image_url && (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-10 bg-whitewash-off">
          <Image
            src={content.image_url}
            alt={content.heading}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      <div
        className="prose prose-sm max-w-none prose-headings:font-medium prose-headings:text-brown prose-p:text-brown-light prose-p:leading-relaxed prose-li:text-brown-light prose-strong:text-brown"
        dangerouslySetInnerHTML={{ __html: content.body }}
      />
    </div>
  )
}
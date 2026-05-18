import { faqMetadata } from '@/lib/static-metadata'
import { getSectionContent } from '@/lib/sections'
import { FaqAccordion } from '@/components/cms/FaqAccordion'

export const metadata = faqMetadata

export default async function FaqPage() {
  const content = await getSectionContent('faq', {
    heading: 'Frequently Asked Questions',
    items: [] as { q: string; a: string }[],
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <p className="text-xs text-brown-light uppercase tracking-widest mb-3">Help</p>
      <h1 className="text-4xl font-light text-brown mb-10">{content.heading}</h1>
      {content.items.length > 0 ? (
        <FaqAccordion items={content.items} />
      ) : (
        <p className="text-brown-light">No questions yet — check back soon.</p>
      )}
    </div>
  )
}
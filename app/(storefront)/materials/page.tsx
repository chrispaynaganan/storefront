import type { Metadata } from 'next'
import { materialsMetadata } from '@/lib/static-metadata'
 
export const metadata = materialsMetadata

export default function MaterialsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <p className="text-xs text-brown-light uppercase tracking-widest mb-4">Craft</p>
      <h1 className="text-4xl font-light text-brown mb-6">Our Materials</h1>
      <p className="text-brown-light leading-relaxed mb-12">
        We use fabrics that hold up — not just through one season, but through years of wear.
      </p>

      <section className="mb-12">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-6">Shirts</h2>
        <div className="space-y-4 text-sm text-brown-light leading-relaxed">
          <div className="bg-whitewash-off rounded-xl p-5">
            <p className="text-brown font-medium mb-1">280gsm Cotton Jersey</p>
            <p>Heavyweight, pre-shrunk cotton that keeps its shape wash after wash. Soft on the skin, structured enough to hold a good silhouette.</p>
          </div>
          <p>We use ring-spun cotton for a smoother, more refined texture — not the cheap open-end stuff.</p>
        </div>
      </section>

      <section className="mb-12 border-t border-peach-light pt-10">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-6">Hoodies</h2>
        <div className="space-y-4 text-sm text-brown-light leading-relaxed">
          <div className="bg-whitewash-off rounded-xl p-5">
            <p className="text-brown font-medium mb-1">380gsm French Terry Fleece</p>
            <p>Thick, warm, and built to last. French terry construction gives a smooth outer face with a soft looped interior.</p>
          </div>
          <p>No pilling after the first wash. The weight gives the hoodie a premium drape without feeling stiff.</p>
        </div>
      </section>

      <section className="mb-12 border-t border-peach-light pt-10">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-6">Why it matters</h2>
        <div className="space-y-3 text-sm text-brown-light leading-relaxed">
          <p>Fast fashion uses lighter fabrics to cut costs. We don't. Heavier weight means better drape, longer life, and a feel that actually justifies keeping something in your rotation.</p>
          <p>Every fabric we use is tested for shrinkage, color retention, and print adhesion before it goes into production.</p>
        </div>
      </section>

      <section className="border-t border-peach-light pt-10">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-4">Questions about materials?</h2>
        <p className="text-sm text-brown-light">
          Reach us at <a href="mailto:mark.payns@gmail.com" className="text-brown underline">mark.payns@gmail.com</a>
        </p>
      </section>
    </div>
  )
}
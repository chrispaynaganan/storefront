import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Printing Process — Known & Worn' }

export default function PrintingProcessPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <p className="text-xs text-brown-light uppercase tracking-widest mb-4">Craft</p>
      <h1 className="text-4xl font-light text-brown mb-6">Our Printing Process</h1>
      <p className="text-brown-light leading-relaxed mb-12">
        The print is part of the piece — not just decoration on top of it.
      </p>

      <section className="mb-12">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-6">Screen printing</h2>
        <div className="space-y-4 text-sm text-brown-light leading-relaxed">
          <div className="bg-whitewash-off rounded-xl p-5">
            <p className="text-brown font-medium mb-1">Water-based ink on heavyweight cotton</p>
            <p>Screen printing forces ink directly into the fabric fibers rather than sitting on top. The result is a print that moves with the garment and doesn't crack or peel.</p>
          </div>
          <p>We use water-based inks over plastisol — they're softer to the touch and more breathable, especially on heavier fabrics.</p>
        </div>
      </section>

      <section className="mb-12 border-t border-peach-light pt-10">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-6">Why not DTG?</h2>
        <div className="space-y-3 text-sm text-brown-light leading-relaxed">
          <p>Direct-to-garment printing is fast and cheap for small runs. But on heavyweight cotton, the results are often dull and the prints fade faster.</p>
          <p>Screen printing takes more setup but produces sharper, more durable results on the materials we use. For the volumes we run, it's worth it.</p>
        </div>
      </section>

      <section className="mb-12 border-t border-peach-light pt-10">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-6">Embroidery</h2>
        <div className="space-y-3 text-sm text-brown-light leading-relaxed">
          <p>Select pieces use embroidery for logos and small graphic details. Embroidered elements are stitched directly into the fabric for a textured, premium finish.</p>
          <p>Embroidery holds color better over time and adds dimension that print can't replicate.</p>
        </div>
      </section>

      <section className="border-t border-peach-light pt-10">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-4">Care for your print</h2>
        <div className="space-y-2 text-sm text-brown-light leading-relaxed">
          <p>Wash inside out on a cold, gentle cycle to preserve print quality.</p>
          <p>Avoid bleach and high-heat drying. Air drying extends the life of both the fabric and the print.</p>
        </div>
      </section>
    </div>
  )
}
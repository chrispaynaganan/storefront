import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Returns & Exchanges — Known & Worn' }

export default function ReturnsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <p className="text-xs text-brown-light uppercase tracking-widest mb-4">Policies</p>
      <h1 className="text-4xl font-light text-brown mb-6">Returns & Exchanges</h1>
      <p className="text-brown-light leading-relaxed mb-12">
        We want you to love what you wear. If something isn't right, here's how we handle it.
      </p>

      <section className="mb-12">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-6">Returns</h2>
        <div className="space-y-3 text-sm text-brown-light leading-relaxed">
          <p>Returns are accepted within <span className="text-brown font-medium">7 days</span> of receiving your order.</p>
          <p>Items must be unused, unwashed, and in original condition with tags attached.</p>
          <p>Once received and inspected, we'll process your refund or store credit within 5–10 business days.</p>
        </div>
      </section>

      <section className="mb-12 border-t border-peach-light pt-10">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-6">Exchanges</h2>
        <div className="space-y-3 text-sm text-brown-light leading-relaxed">
          <p>Size and color exchanges are available subject to stock availability.</p>
          <p>If your preferred option is out of stock, you can choose another item or receive store credit.</p>
          <div className="bg-peach-light/40 rounded-xl p-4 text-brown text-sm">
            Free size exchange on your first order.
          </div>
        </div>
      </section>

      <section className="mb-12 border-t border-peach-light pt-10">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-6">Non-returnable items</h2>
        <ul className="space-y-2 text-sm text-brown-light">
          {['Sale or discounted items', 'Underwear and intimate wear', 'Custom or made-to-order pieces'].map(item => (
            <li key={item} className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-brown-light shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12 border-t border-peach-light pt-10">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-6">Wrong or damaged items</h2>
        <div className="space-y-3 text-sm text-brown-light leading-relaxed">
          <p>Let us know within <span className="text-brown font-medium">48 hours</span> of delivery.</p>
          <p>Send your order number and photos to <a href="mailto:mark.payns@gmail.com" className="text-brown underline">mark.payns@gmail.com</a>.</p>
          <p>We'll cover shipping and send a replacement or full refund.</p>
        </div>
      </section>

      <section className="border-t border-peach-light pt-10">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-6">Start a return</h2>
        <p className="text-sm text-brown-light leading-relaxed mb-6">
          Email <a href="mailto:mark.payns@gmail.com" className="text-brown underline">mark.payns@gmail.com</a> with your order number, reason for return, and photos if applicable. Return shipping is handled by the customer unless the item is faulty or incorrect.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-brown text-whitewash text-sm font-medium rounded-full px-8 py-3 hover:bg-brown-light transition-colors"
        >
          Contact us
        </Link>
      </section>
    </div>
  )
}
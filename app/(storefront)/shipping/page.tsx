import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shipping & Returns — Known & Worn',
}

export default function ShippingPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">

      <p className="text-xs text-brown-light uppercase tracking-widest mb-4">Policies</p>
      <h1 className="text-4xl font-light text-brown mb-6">Shipping & Returns</h1>
      <p className="text-brown-light leading-relaxed mb-12">
        We design pieces you'll actually wear. But if something doesn't feel right, here's how we handle it.
      </p>

      {/* Shipping */}
      <section className="mb-12">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-6">Shipping</h2>
        <div className="space-y-4 text-sm text-brown-light leading-relaxed">
          <p>We ship nationwide across the Philippines. International shipping is available — rates and delivery times vary by destination.</p>
          <div className="bg-whitewash-off rounded-xl p-5 space-y-3">
            <div className="flex justify-between text-brown">
              <span>Metro Manila</span><span>2–4 business days</span>
            </div>
            <div className="flex justify-between">
              <span>Provincial (Luzon)</span><span>3–6 business days</span>
            </div>
            <div className="flex justify-between">
              <span>Visayas & Mindanao</span><span>5–8 business days</span>
            </div>
            <div className="flex justify-between">
              <span>International</span><span>7–21 business days</span>
            </div>
          </div>
          <p>Shipping fees are calculated at checkout based on your location and order weight.</p>
          <p>Orders are processed within 1–2 business days. You'll receive a tracking number once your order ships.</p>
        </div>
      </section>

      {/* Returns */}
      <section className="mb-12 border-t border-peach-light pt-10">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-6">Returns</h2>
        <div className="space-y-3 text-sm text-brown-light leading-relaxed">
          <p>Returns are accepted within <span className="text-brown font-medium">7 days</span> of receiving your order.</p>
          <p>Items must be unused, unwashed, and in original condition with tags attached.</p>
          <p>Once received and checked, we'll process your refund or store credit.</p>
        </div>
      </section>

      {/* Exchanges */}
      <section className="mb-12 border-t border-peach-light pt-10">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-6">Exchanges</h2>
        <div className="space-y-3 text-sm text-brown-light leading-relaxed">
          <p>You can request an exchange for size or color, depending on availability.</p>
          <p>If your preferred option is out of stock, you can choose another item or receive store credit.</p>
          <div className="bg-peach-light/40 rounded-xl p-4 text-brown text-sm">
            Free size exchange on your first order.
          </div>
        </div>
      </section>

      {/* Refunds */}
      <section className="mb-12 border-t border-peach-light pt-10">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-6">Refunds</h2>
        <div className="space-y-3 text-sm text-brown-light leading-relaxed">
          <p>Refunds go back to your original payment method.</p>
          <p>Shipping fees are non-refundable.</p>
          <p>Processing takes <span className="text-brown font-medium">5–10 business days</span> after we receive your return.</p>
        </div>
      </section>

      {/* Non-returnable */}
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

      {/* Wrong or damaged */}
      <section className="mb-12 border-t border-peach-light pt-10">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-6">Wrong or damaged items</h2>
        <div className="space-y-3 text-sm text-brown-light leading-relaxed">
          <p>Let us know within <span className="text-brown font-medium">48 hours</span> of delivery.</p>
          <p>Send your order number and photos to <a href="mailto:mark.payns@gmail.com" className="text-brown underline">mark.payns@gmail.com</a>.</p>
          <p>We'll cover shipping and send a replacement or full refund.</p>
        </div>
      </section>

      {/* Start a return */}
      <section className="border-t border-peach-light pt-10">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-6">Start a return</h2>
        <p className="text-sm text-brown-light leading-relaxed mb-4">
          Email <a href="mailto:mark.payns@gmail.com" className="text-brown underline">mark.payns@gmail.com</a> or message <a href="tel:09156228350" className="text-brown underline">09156228350</a> with your order number, reason for return, and photos if needed.
        </p>
        <p className="text-sm text-brown-light">Return shipping is handled by the customer unless the item is faulty or incorrect. Use a trackable courier to avoid issues.</p>
      </section>

    </div>
  )
}
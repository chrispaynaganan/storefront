import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Known & Worn',
}

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">

      <p className="text-xs text-brown-light uppercase tracking-widest mb-4">Legal</p>
      <h1 className="text-4xl font-light text-brown mb-4">Terms of Service</h1>
      <p className="text-sm text-brown-light mb-12">Last updated: May 2026</p>

      <div className="space-y-10 text-sm text-brown-light leading-relaxed">

        <section>
          <h2 className="text-brown font-medium mb-3">1. Acceptance of terms</h2>
          <p>By accessing or using the Known & Worn website, you agree to be bound by these terms. If you do not agree, please do not use the site.</p>
        </section>

        <section>
          <h2 className="text-brown font-medium mb-3">2. Products and pricing</h2>
          <p>All prices are listed in Philippine Peso (PHP). We reserve the right to change prices at any time without notice. We are not responsible for typographical errors in pricing.</p>
        </section>

        <section>
          <h2 className="text-brown font-medium mb-3">3. Orders and payment</h2>
          <p>By placing an order, you confirm that all information provided is accurate. We reserve the right to cancel or refuse any order at our discretion. Payment is processed through PayPal.</p>
        </section>

        <section>
          <h2 className="text-brown font-medium mb-3">4. Shipping and delivery</h2>
          <p>Delivery times are estimates and not guaranteed. Known & Worn is not responsible for delays caused by couriers or customs. Risk of loss passes to you upon delivery.</p>
        </section>

        <section>
          <h2 className="text-brown font-medium mb-3">5. Returns and refunds</h2>
          <p>Returns and exchanges are subject to our <a href="/shipping" className="text-brown underline">Shipping & Returns policy</a>. By placing an order, you agree to those terms.</p>
        </section>

        <section>
          <h2 className="text-brown font-medium mb-3">6. Intellectual property</h2>
          <p>All content on this site — including images, copy, and design — is owned by Known & Worn. You may not reproduce or use any content without written permission.</p>
        </section>

        <section>
          <h2 className="text-brown font-medium mb-3">7. Limitation of liability</h2>
          <p>Known & Worn is not liable for any indirect, incidental, or consequential damages arising from use of the site or products purchased.</p>
        </section>

        <section>
          <h2 className="text-brown font-medium mb-3">8. Changes to terms</h2>
          <p>We may update these terms at any time. Continued use of the site after changes constitutes acceptance of the new terms.</p>
        </section>

        <section>
          <h2 className="text-brown font-medium mb-3">9. Contact</h2>
          <p>For any questions about these terms, contact us at <a href="mailto:mark.payns@gmail.com" className="text-brown underline">mark.payns@gmail.com</a>.</p>
        </section>

      </div>
    </div>
  )
}
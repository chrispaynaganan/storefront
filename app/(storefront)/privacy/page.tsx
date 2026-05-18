import type { Metadata } from 'next'
import { privacyMetadata } from '@/lib/static-metadata'
 
export const metadata = privacyMetadata

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">

      <p className="text-xs text-brown-light uppercase tracking-widest mb-4">Legal</p>
      <h1 className="text-4xl font-light text-brown mb-4">Privacy Policy</h1>
      <p className="text-sm text-brown-light mb-12">Last updated: May 2026</p>

      <div className="space-y-10 text-sm text-brown-light leading-relaxed">

        <section>
          <h2 className="text-brown font-medium mb-3">1. Information we collect</h2>
          <p>When you create an account or place an order, we collect your name, email address, shipping address, and payment information. We also collect usage data such as pages visited and actions taken on the site.</p>
        </section>

        <section>
          <h2 className="text-brown font-medium mb-3">2. How we use your information</h2>
          <p>We use your information to process orders, send order confirmations and updates, respond to inquiries, and improve our site and products. We do not sell your personal data to third parties.</p>
        </section>

        <section>
          <h2 className="text-brown font-medium mb-3">3. Payment processing</h2>
          <p>Payments are processed securely through PayPal. We do not store your full payment card details on our servers. PayPal's privacy policy governs how your payment information is handled.</p>
        </section>

        <section>
          <h2 className="text-brown font-medium mb-3">4. Cookies</h2>
          <p>We use cookies to keep you signed in, remember your cart, and understand how the site is used. You can disable cookies in your browser settings, but some features may not work correctly.</p>
        </section>

        <section>
          <h2 className="text-brown font-medium mb-3">5. Third-party services</h2>
          <p>We use Supabase for authentication and data storage, and PayPal for payment processing. These services have their own privacy policies which we encourage you to review.</p>
        </section>

        <section>
          <h2 className="text-brown font-medium mb-3">6. Data retention</h2>
          <p>We retain your account and order data for as long as your account is active or as needed to provide services. You can request deletion of your data by contacting us.</p>
        </section>

        <section>
          <h2 className="text-brown font-medium mb-3">7. Your rights</h2>
          <p>You have the right to access, correct, or delete your personal data. To make a request, email us at <a href="mailto:mark.payns@gmail.com" className="text-brown underline">mark.payns@gmail.com</a>.</p>
        </section>

        <section>
          <h2 className="text-brown font-medium mb-3">8. Contact</h2>
          <p>For any privacy-related questions, contact us at <a href="mailto:mark.payns@gmail.com" className="text-brown underline">mark.payns@gmail.com</a>.</p>
        </section>

      </div>
    </div>
  )
}
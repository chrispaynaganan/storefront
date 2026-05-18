import type { Metadata } from 'next'
import Link from 'next/link'
import { trackOrderMetadata } from '@/lib/static-metadata'
 
export const metadata = trackOrderMetadata

export default function TrackOrderPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <p className="text-xs text-brown-light uppercase tracking-widest mb-4">Orders</p>
      <h1 className="text-4xl font-light text-brown mb-6">Track Your Order</h1>
      <p className="text-brown-light leading-relaxed mb-10">
        Once your order ships, you'll receive a tracking number via email. Use that number on your courier's website to track your delivery.
      </p>

      <div className="bg-whitewash-off rounded-2xl p-6 mb-10 space-y-4">
        <h2 className="text-sm font-medium text-brown">Have an account?</h2>
        <p className="text-sm text-brown-light leading-relaxed">
          Log in to view your order history and current order status under My Orders.
        </p>
        <Link
          href="/account/orders"
          className="inline-block bg-brown text-whitewash text-sm font-medium rounded-full px-6 py-2.5 hover:bg-brown-light transition-colors"
        >
          View my orders
        </Link>
      </div>

      <div className="border-t border-peach-light pt-10 space-y-4">
        <h2 className="text-xs text-brown-light uppercase tracking-widest mb-6">Couriers we use</h2>
        <div className="space-y-3 text-sm text-brown-light">
          <p>We ship via J&T Express, Ninja Van, and LBC for domestic orders.</p>
          <p>International orders are handled via DHL or similar international couriers.</p>
          <p>Tracking numbers are sent via email once your order is dispatched — usually within 1–2 business days of placing your order.</p>
        </div>
      </div>

      <div className="border-t border-peach-light pt-10 mt-10">
        <p className="text-sm text-brown-light mb-4">
          Can't find your tracking number or need help with your order?
        </p>
        <Link
          href="/contact"
          className="inline-block border border-brown text-brown text-sm font-medium rounded-full px-6 py-2.5 hover:bg-brown hover:text-whitewash transition-colors"
        >
          Contact support
        </Link>
      </div>
    </div>
  )
}
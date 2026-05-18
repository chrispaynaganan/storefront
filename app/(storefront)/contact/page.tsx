import type { Metadata } from 'next'
import { contactMetadata } from '@/lib/static-metadata'
 
export const metadata = contactMetadata

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">

      <p className="text-xs text-brown-light uppercase tracking-widest mb-4">Contact</p>
      <h1 className="text-4xl font-light text-brown mb-4">Get in touch</h1>
      <p className="text-brown-light leading-relaxed mb-12">
        Questions about an order, sizing, or anything else — we're easy to reach and we actually reply.
      </p>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-peach-light p-6">
          <p className="text-xs text-brown-light uppercase tracking-widest mb-1">Email</p>
          <a href="mailto:mark.payns@gmail.com" className="text-brown font-medium hover:text-brown-light transition-colors">
            mark.payns@gmail.com
          </a>
          <p className="text-xs text-brown-light mt-1">We reply within 24 hours on business days.</p>
        </div>

        <div className="bg-white rounded-xl border border-peach-light p-6">
          <p className="text-xs text-brown-light uppercase tracking-widest mb-1">Phone / SMS</p>
          <a href="tel:09156228350" className="text-brown font-medium hover:text-brown-light transition-colors">
            0915 622 8350
          </a>
          <p className="text-xs text-brown-light mt-1">Available Mon–Sat, 9am–6pm PHT.</p>
        </div>

        <div className="bg-white rounded-xl border border-peach-light p-6">
          <p className="text-xs text-brown-light uppercase tracking-widest mb-1">Returns & order issues</p>
          <p className="text-sm text-brown-light leading-relaxed">
            For returns, exchanges, or damaged items — include your order number and photos when you reach out. It helps us resolve things faster.
          </p>
        </div>
      </div>

    </div>
  )
}
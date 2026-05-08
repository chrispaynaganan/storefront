import Link from 'next/link'
import { SITE_NAME } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="border-t border-peach-light bg-whitewash mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm text-brown-light">
        <div>
          <p className="font-medium text-brown mb-3">{SITE_NAME}</p>
          <p>Premium clothing from the Philippines.</p>
        </div>
        <div>
          <p className="font-medium text-brown mb-3">Shop</p>
          <ul className="space-y-2">
            <li><Link href="/products" className="hover:text-brown">All products</Link></li>
            <li><Link href="/collections/hoodies" className="hover:text-brown">Hoodies</Link></li>
            <li><Link href="/collections/shirts" className="hover:text-brown">Shirts</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-brown mb-3">Account</p>
          <ul className="space-y-2">
            <li><Link href="/login" className="hover:text-brown">Sign in</Link></li>
            <li><Link href="/register" className="hover:text-brown">Create account</Link></li>
            <li><Link href="/account/orders" className="hover:text-brown">Orders</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-brown mb-3">Help</p>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-brown">Shipping info</a></li>
            <li><a href="#" className="hover:text-brown">Returns</a></li>
            <li><a href="#" className="hover:text-brown">Contact us</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-peach-light text-center text-xs text-brown-light py-4">
        © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  )
}

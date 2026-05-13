import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'

export function Footer() {
  return (
    <footer className="border-t border-peach-light bg-whitewash mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm text-brown-light">
        <div>
          <div className="mb-3">
            <Logo width={110} />
          </div>
          <p className="leading-relaxed">Clean, expressive streetwear. Built for everyday wear, made in the Philippines.</p>
          <div className="flex items-center gap-3 mt-4">
            <a href="https://www.facebook.com/profile.php?id=61570705350137" target="_blank" rel="noopener noreferrer"
              className="hover:text-brown transition-colors" aria-label="Facebook">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="mailto:mark.payns@gmail.com"
              className="hover:text-brown transition-colors" aria-label="Email us">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <p className="font-medium text-brown mb-3">Shop</p>
          <ul className="space-y-2">
            <li><Link href="/products" className="hover:text-brown transition-colors">All products</Link></li>
            <li><Link href="/women" className="hover:text-brown transition-colors">Women</Link></li>
            <li><Link href="/men" className="hover:text-brown transition-colors">Men</Link></li>
            <li><Link href="/kids" className="hover:text-brown transition-colors">Kids</Link></li>
            <li><Link href="/sports" className="hover:text-brown transition-colors">Sports</Link></li>
            <li><Link href="/new" className="hover:text-brown transition-colors">New arrivals</Link></li>
            <li><Link href="/collections/hoodies" className="hover:text-brown transition-colors">Hoodies</Link></li>
            <li><Link href="/collections/shirts" className="hover:text-brown transition-colors">Shirts</Link></li>
            <li><Link href="/sale" className="hover:text-red-500 transition-colors">Sale</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-medium text-brown mb-3">Account</p>
          <ul className="space-y-2">
            <li><Link href="/login" className="hover:text-brown transition-colors">Sign in</Link></li>
            <li><Link href="/register" className="hover:text-brown transition-colors">Create account</Link></li>
            <li><Link href="/account/orders" className="hover:text-brown transition-colors">Orders</Link></li>
            <li><Link href="/favorites" className="hover:text-brown transition-colors">Favorites</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-medium text-brown mb-3">Help</p>
          <ul className="space-y-2">
            <li><Link href="/shipping" className="hover:text-brown transition-colors">Shipping & Returns</Link></li>
            <li><Link href="/contact" className="hover:text-brown transition-colors">Contact us</Link></li>
            <li><Link href="/about" className="hover:text-brown transition-colors">About</Link></li>
            <li><Link href="/privacy" className="hover:text-brown transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-brown transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-peach-light text-center text-xs text-brown-light py-4 space-x-4">
        <span>© {new Date().getFullYear()} Known & Worn. All rights reserved.</span>
        <Link href="/privacy" className="hover:text-brown transition-colors">Privacy</Link>
        <Link href="/terms" className="hover:text-brown transition-colors">Terms</Link>
      </div>
    </footer>
  )
}
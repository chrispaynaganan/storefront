import Link from 'next/link'
import Image from 'next/image'
import { Logo } from '@/components/ui/Logo'

export function Footer() {
  return (
    <footer className="border-t border-peach-light bg-whitewash mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm text-brown-light">

        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <div className="mb-3">
            <Logo width={110} />
          </div>

          <p className="leading-relaxed">
            Clean, expressive streetwear. Built for everyday wear, made in the Philippines.
          </p>

          <div className="flex items-center gap-3 mt-4">
            <a
              href="https://www.facebook.com/profile.php?id=61570705350137"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brown transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            <a
              href="mailto:mark.payns@gmail.com"
              className="hover:text-brown transition-colors"
              aria-label="Email us"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Shop */}
        <div>
          <p className="font-medium text-brown mb-3">Shop</p>
          <ul className="space-y-2">
            <li><Link href="/shop" className="hover:text-brown transition-colors">All products</Link></li>
            <li><Link href="/new-arrivals" className="hover:text-brown transition-colors">New arrivals</Link></li>
            <li><Link href="/best-sellers" className="hover:text-brown transition-colors">Best sellers</Link></li>
            <li><Link href="/women" className="hover:text-brown transition-colors">Women</Link></li>
            <li><Link href="/men" className="hover:text-brown transition-colors">Men</Link></li>
            <li><Link href="/kids" className="hover:text-brown transition-colors">Kids</Link></li>
            <li><Link href="/sports" className="hover:text-brown transition-colors">Sports</Link></li>
            <li><Link href="/collections" className="hover:text-brown transition-colors">Collections</Link></li>
            <li><Link href="/sale" className="hover:text-red-500 transition-colors">Sale</Link></li>
          </ul>
        </div>

        {/* Learn */}
        <div>
          <p className="font-medium text-brown mb-3">Learn</p>
          <ul className="space-y-2">
            <li><Link href="/about" className="hover:text-brown transition-colors">About</Link></li>
            <li><Link href="/materials" className="hover:text-brown transition-colors">Materials</Link></li>
            <li><Link href="/printing-process" className="hover:text-brown transition-colors">Printing process</Link></li>
            <li><Link href="/fit-guide" className="hover:text-brown transition-colors">Fit guide</Link></li>
            <li><Link href="/care-guide" className="hover:text-brown transition-colors">Care guide</Link></li>
            <li><Link href="/lookbook" className="hover:text-brown transition-colors">Lookbook</Link></li>
            <li><Link href="/journal" className="hover:text-brown transition-colors">Journal</Link></li>
          </ul>
        </div>

        {/* Account */}
        <div>
          <p className="font-medium text-brown mb-3">Account</p>
          <ul className="space-y-2">
            <li><Link href="/login" className="hover:text-brown transition-colors">Sign in</Link></li>
            <li><Link href="/register" className="hover:text-brown transition-colors">Create account</Link></li>
            <li><Link href="/account/orders" className="hover:text-brown transition-colors">My orders</Link></li>
            <li><Link href="/wishlist" className="hover:text-brown transition-colors">Wishlist</Link></li>
            <li><Link href="/track-order" className="hover:text-brown transition-colors">Track order</Link></li>
          </ul>
        </div>

        {/* Help */}
        <div>
          <p className="font-medium text-brown mb-3">Help</p>
          <ul className="space-y-2">
            <li><Link href="/faq" className="hover:text-brown transition-colors">FAQ</Link></li>
            <li><Link href="/shipping" className="hover:text-brown transition-colors">Shipping</Link></li>
            <li><Link href="/returns" className="hover:text-brown transition-colors">Returns</Link></li>
            <li><Link href="/contact" className="hover:text-brown transition-colors">Contact us</Link></li>
            <li><Link href="/privacy" className="hover:text-brown transition-colors">Privacy policy</Link></li>
            <li><Link href="/terms" className="hover:text-brown transition-colors">Terms of service</Link></li>
            <li><Link href="/accessibility" className="hover:text-brown transition-colors">Accessibility</Link></li>
          </ul>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="border-t border-peach-light py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brown-light">

          {/* Left: copyright + legal links */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1">
            <span>© {new Date().getFullYear()} Known & Worn. All rights reserved.</span>
            <Link href="/privacy" className="hover:text-brown transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-brown transition-colors">Terms</Link>
            <Link href="/accessibility" className="hover:text-brown transition-colors">Accessibility</Link>
          </div>

          {/* Right: marketplace icons */}
          <div className="flex items-center gap-2">
            <span className="text-brown-light/50 mr-1">Also on</span>

            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Shop on TikTok Shop"
              className="opacity-60 hover:opacity-100 transition-opacity duration-200"
            >
              <Image
                src="/marketplace/tiktok-shop.webp"
                alt="TikTok Shop"
                width={24}
                height={24}
                className="w-6 h-6 object-contain"
              />
            </a>

            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Shop on Shopee"
              className="opacity-60 hover:opacity-100 transition-opacity duration-200"
            >
              <Image
                src="/marketplace/shopee.webp"
                alt="Shopee"
                width={24}
                height={24}
                className="w-6 h-6 object-contain"
              />
            </a>

            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Shop on Lazada"
              className="opacity-60 hover:opacity-100 transition-opacity duration-200"
            >
              <Image
                src="/marketplace/lazada.webp"
                alt="Lazada"
                width={24}
                height={24}
                className="w-6 h-6 object-contain"
              />
            </a>
          </div>

        </div>
      </div>
    </footer>
  )
}
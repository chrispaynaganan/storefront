import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-whitewash px-4">
      <div className="text-center max-w-md">
        <p className="text-xs text-brown-light uppercase tracking-widest mb-4">404</p>
        <h1 className="text-4xl font-light text-brown mb-3">Page not found</h1>
        <p className="text-brown-light text-sm mb-10">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="bg-brown text-whitewash text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-brown-light transition-colors"
          >
            Go home
          </Link>
          <Link
            href="/products"
            className="border border-brown text-brown text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-whitewash-off transition-colors"
          >
            Browse products
          </Link>
        </div>
      </div>
    </div>
  )
}
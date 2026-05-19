'use client'
import { useEffect } from 'react'
import Link from 'next/link'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // Log to console in dev — swap for a logging service in prod if needed
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-whitewash px-4">
      <div className="text-center max-w-md">
        <p className="text-xs text-brown-light uppercase tracking-widest mb-4">Something went wrong</p>
        <h1 className="text-4xl font-light text-brown mb-3">Unexpected error</h1>
        <p className="text-brown-light text-sm mb-10">
          Sorry about that — something on our end went wrong. Try again or come back later.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="bg-brown text-whitewash text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-brown-light transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="border border-brown text-brown text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-whitewash-off transition-colors"
          >
            Go home
          </Link>
        </div>
        {error.digest && (
          <p className="text-xs text-brown/30 mt-8">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  )
}
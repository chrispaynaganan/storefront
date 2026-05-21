// components/ui/CookieConsent.tsx
'use client'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'kw_cookie_consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setVisible(false)
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto bg-brown text-whitewash rounded-xl shadow-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm leading-relaxed flex-1 text-whitewash/90">
          We use cookies to improve your experience on Known & Worn. By continuing, you agree to our{' '}
          <a href="/privacy" className="underline text-peach hover:text-peach-light transition-colors">
            Privacy Policy
          </a>
          .
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={decline}
            className="text-sm text-whitewash/60 hover:text-whitewash px-3 py-2 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="text-sm bg-peach text-brown font-semibold px-4 py-2 rounded-lg hover:bg-peach-light transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
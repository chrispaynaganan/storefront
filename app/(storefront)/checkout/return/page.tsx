'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Status = 'checking' | 'success' | 'failed' | 'timeout'

export default function CheckoutReturnPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sourceId = searchParams.get('source_id')
  const urlStatus = searchParams.get('status') // 'success' | 'failed' from PayMongo redirect

  const [status, setStatus] = useState<Status>('checking')
  const [attempts, setAttempts] = useState(0)
  const MAX_ATTEMPTS = 15 // 15 × 2s = 30s max

  useEffect(() => {
    if (!sourceId) {
      setStatus('failed')
      return
    }

    // If PayMongo told us it failed immediately, no need to poll
    if (urlStatus === 'failed') {
      setStatus('failed')
      return
    }

    const poll = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('pending_paymongo_checkouts')
          .select('status, order_id')
          .eq('source_id', sourceId)
          .single()

        if (error || !data) {
          // Row doesn't exist yet — keep polling
          return false
        }

        if (data.status === 'completed' && data.order_id) {
          router.replace(`/order/${data.order_id}`)
          return true
        }

        if (data.status === 'failed') {
          setStatus('failed')
          return true
        }

        // pending or processing — keep polling
        return false
      } catch {
        return false
      }
    }

    const interval = setInterval(async () => {
      setAttempts((prev) => {
        const next = prev + 1
        if (next >= MAX_ATTEMPTS) {
          clearInterval(interval)
          setStatus('timeout')
        }
        return next
      })

      const done = await poll()
      if (done) clearInterval(interval)
    }, 2000)

    // Run immediately on mount too
    poll()

    return () => clearInterval(interval)
  }, [sourceId, urlStatus, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-whitewash px-4 text-center">
      {status === 'checking' && (
        <>
          <div className="mb-6 h-12 w-12 animate-spin rounded-full border-4 border-peach border-t-brown" />
          <h1 className="font-gelasio text-2xl text-brown">Confirming your payment…</h1>
          <p className="mt-2 text-sm text-brown/60">
            This usually takes a few seconds. Please don't close this page.
          </p>
          <p className="mt-1 text-xs text-brown/40">
            Checking {attempts}/{MAX_ATTEMPTS}
          </p>
        </>
      )}

      {status === 'failed' && (
        <>
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <svg className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="font-gelasio text-2xl text-brown">Payment was not completed</h1>
          <p className="mt-2 text-sm text-brown/60">
            Your payment was cancelled or failed. Your cart is still intact.
          </p>
          <button
            onClick={() => router.push('/checkout')}
            className="mt-6 rounded-full bg-brown px-6 py-2.5 text-sm text-white hover:bg-brown-light transition-colors"
          >
            Back to checkout
          </button>
        </>
      )}

      {status === 'timeout' && (
        <>
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-peach-light">
            <svg className="h-7 w-7 text-brown" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="font-gelasio text-2xl text-brown">Still processing…</h1>
          <p className="mt-2 max-w-sm text-sm text-brown/60">
            Your payment may still be completing. Check your{' '}
            <button
              onClick={() => router.push('/account/orders')}
              className="underline underline-offset-2"
            >
              order history
            </button>{' '}
            in a minute — your order will appear there once confirmed.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => router.push('/account/orders')}
              className="rounded-full bg-brown px-6 py-2.5 text-sm text-white hover:bg-brown-light transition-colors"
            >
              My orders
            </button>
            <button
              onClick={() => router.push('/')}
              className="rounded-full border border-brown px-6 py-2.5 text-sm text-brown hover:bg-peach-light transition-colors"
            >
              Go home
            </button>
          </div>
        </>
      )}
    </div>
  )
}
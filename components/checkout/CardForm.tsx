'use client'

import { useState } from 'react'
import clsx from 'clsx'

interface CardFormProps {
  intentId: string
  clientKey: string
  userEmail: string
  onSuccess: (intentId: string) => void
  onError: (msg: string) => void
  loading: boolean
  setLoading: (v: boolean) => void
}

function formatCardNumber(value: string): string {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return digits
}

function detectCardBrand(number: string): string {
  const n = number.replace(/\s/g, '')
  if (/^4/.test(n)) return 'visa'
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'mastercard'
  return 'unknown'
}

function CardBrandIcon({ brand }: { brand: string }) {
  if (brand === 'visa') {
    return (
      <svg viewBox="0 0 48 16" className="h-4 w-auto" fill="none">
        <text x="0" y="13" fill="#1A1F71" fontSize="14" fontWeight="800" fontFamily="Arial,sans-serif">VISA</text>
      </svg>
    )
  }
  if (brand === 'mastercard') {
    return (
      <svg viewBox="0 0 36 24" className="h-5 w-auto" fill="none">
        <circle cx="14" cy="12" r="10" fill="#EB001B" />
        <circle cx="22" cy="12" r="10" fill="#F79E1B" />
        <path d="M18 5.5a10 10 0 0 1 0 13A10 10 0 0 1 18 5.5z" fill="#FF5F00" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-brown/30" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5z" />
    </svg>
  )
}

export default function CardForm({
  intentId,
  clientKey,
  userEmail,
  onSuccess,
  onError,
  loading,
  setLoading,
}: CardFormProps) {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')
  const [cardName, setCardName] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const brand = detectCardBrand(cardNumber)

  function validate(): boolean {
    const errors: Record<string, string> = {}
    const rawNumber = cardNumber.replace(/\s/g, '')
    if (rawNumber.length < 16) errors.cardNumber = 'Enter a valid 16-digit card number'
    if (expiry.length < 5) errors.expiry = 'Enter expiry as MM/YY'
    if (cvc.length < 3) errors.cvc = 'Enter 3-digit CVV'
    if (!cardName.trim()) errors.cardName = 'Enter the name on card'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true)
    setFieldErrors({})

    try {
      const [expMonth, expYear] = expiry.split('/')
      const rawNumber = cardNumber.replace(/\s/g, '')

      const publicKey = process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY!
      const encodedPublic = btoa(`${publicKey}:`)

      // Tokenize card with billing email
      const pmRes = await fetch('https://api.paymongo.com/v1/payment_methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${encodedPublic}`,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              type: 'card',
              details: {
                card_number: rawNumber,
                exp_month: parseInt(expMonth, 10),
                exp_year: parseInt(`20${expYear}`, 10),
                cvc,
              },
              billing: {
                name: cardName,
                email: userEmail,
              },
            },
          },
        }),
      })

      const pmJson = await pmRes.json()

      if (!pmRes.ok) {
        const errMsg = pmJson?.errors?.[0]?.detail ?? 'Invalid card details'
        onError(errMsg)
        setLoading(false)
        return
      }

      const paymentMethodId: string = pmJson.data.id

      // Attach to intent via our server
      const attachRes = await fetch('/api/paymongo/attach-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent_id: intentId, payment_method_id: paymentMethodId }),
      })

      const attachData = await attachRes.json()

      if (!attachRes.ok) {
        onError(attachData.error ?? 'Payment failed')
        setLoading(false)
        return
      }

      if (attachData.status === '3ds_required') {
        window.location.href = attachData.redirect_url
        return
      }

      if (attachData.status === 'succeeded') {
        onSuccess(intentId)
        return
      }

      onError(attachData.error ?? 'Payment was not completed')
      setLoading(false)
    } catch (err: any) {
      onError(err.message ?? 'Something went wrong')
      setLoading(false)
    }
  }

  const inputClass = (field: string) =>
    clsx(
      'w-full rounded-xl border bg-white px-4 py-3 text-sm text-brown placeholder:text-brown/40 focus:outline-none transition-colors',
      fieldErrors[field]
        ? 'border-red-300 focus:border-red-400'
        : 'border-whitewash-off focus:border-brown'
    )

  return (
    <div className="space-y-3 pt-1">
      <div>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Card number"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            maxLength={19}
            className={clsx(inputClass('cardNumber'), 'pr-12')}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <CardBrandIcon brand={brand} />
          </span>
        </div>
        {fieldErrors.cardNumber && (
          <p className="mt-1 text-xs text-red-500">{fieldErrors.cardNumber}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <input
            type="text"
            inputMode="numeric"
            placeholder="MM/YY"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            maxLength={5}
            className={inputClass('expiry')}
          />
          {fieldErrors.expiry && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.expiry}</p>
          )}
        </div>
        <div>
          <input
            type="text"
            inputMode="numeric"
            placeholder="CVV"
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
            className={inputClass('cvc')}
          />
          {fieldErrors.cvc && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.cvc}</p>
          )}
        </div>
      </div>

      <div>
        <input
          type="text"
          placeholder="Name on card"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          className={inputClass('cardName')}
        />
        {fieldErrors.cardName && (
          <p className="mt-1 text-xs text-red-500">{fieldErrors.cardName}</p>
        )}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-brown/40">
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        Secured by PayMongo · 256-bit SSL
      </p>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full rounded-full bg-brown py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Processing…' : 'Pay with Card'}
      </button>
    </div>
  )
}
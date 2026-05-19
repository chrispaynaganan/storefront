'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PayPalButton } from '@/components/checkout/PayPalButton'
import { logAction } from '@/lib/log-client'
import clsx from 'clsx'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AddressForm {
  line1: string
  line2: string
  city: string
  province: string
  country: string
  postal_code: string
}

interface SavedAddress {
  id: string
  line1: string
  line2?: string | null
  city: string
  province: string
  country: string
  postal_code: string
  is_default: boolean
}

export type PaymentMethod = 'gcash' | 'maya' | 'paypal' | 'cod'

// ── Payment method icon components ───────────────────────────────────────────

function GCashIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-6 w-auto" fill="none">
      <rect width="48" height="48" rx="8" fill="#007DFF"/>
      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="700" fontFamily="Arial,sans-serif">GCash</text>
    </svg>
  )
}

function MayaIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-6 w-auto" fill="none">
      <rect width="48" height="48" rx="8" fill="#31B057"/>
      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="11" fontWeight="700" fontFamily="Arial,sans-serif">Maya</text>
    </svg>
  )
}

function PayPalIcon() {
  return (
    <svg viewBox="0 0 80 24" className="h-5 w-auto" fill="none">
      <text x="0" y="18" fill="#003087" fontSize="18" fontWeight="700" fontFamily="Arial,sans-serif">Pay</text>
      <text x="30" y="18" fill="#009cde" fontSize="18" fontWeight="700" fontFamily="Arial,sans-serif">Pal</text>
    </svg>
  )
}

function CODIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-brown/60" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  )
}

// ── Payment method selector ───────────────────────────────────────────────────

const PAYMENT_METHODS: { id: PaymentMethod; label: string; sub: string; icon: React.ReactNode }[] = [
  { id: 'gcash', label: 'GCash', sub: 'E-wallet', icon: <GCashIcon /> },
  { id: 'maya', label: 'Maya', sub: 'E-wallet', icon: <MayaIcon /> },
  { id: 'paypal', label: 'PayPal', sub: 'Card / PayPal balance', icon: <PayPalIcon /> },
  { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when it arrives', icon: <CODIcon /> },
]

function PaymentMethodPicker({
  selected,
  onChange,
}: {
  selected: PaymentMethod
  onChange: (m: PaymentMethod) => void
}) {
  return (
    <div className="space-y-2">
      {PAYMENT_METHODS.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onChange(m.id)}
          className={clsx(
            'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all',
            selected === m.id
              ? 'border-brown bg-peach-light'
              : 'border-whitewash-off bg-white hover:border-brown/40'
          )}
        >
          <span
            className={clsx(
              'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all',
              selected === m.id ? 'border-brown' : 'border-brown/30'
            )}
          >
            {selected === m.id && <span className="h-2 w-2 rounded-full bg-brown" />}
          </span>
          <span className="flex flex-1 items-center justify-between gap-2">
            <span>
              <span className="block text-sm font-medium text-brown">{m.label}</span>
              <span className="block text-xs text-brown/50">{m.sub}</span>
            </span>
            <span className="shrink-0">{m.icon}</span>
          </span>
        </button>
      ))}
    </div>
  )
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={clsx(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors',
        on ? 'bg-brown' : 'bg-brown/20'
      )}
    >
      <span
        className={clsx(
          'absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform',
          on ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface CheckoutClientProps {
  orderSummary: React.ReactNode
  userId: string
  userEmail: string
  cartTotal: number
  savedAddresses: SavedAddress[]
}

const EMPTY: AddressForm = {
  line1: '', line2: '', city: '', province: '', country: 'PH', postal_code: '',
}

export default function CheckoutClient({
  userId,
  userEmail,
  cartTotal,
  savedAddresses,
  orderSummary,
}: CheckoutClientProps) {
  const router = useRouter()

  const [address, setAddress] = useState<AddressForm>(EMPTY)
  const [saveAddress, setSaveAddress] = useState(false)
  const [saveAsDefault, setSaveAsDefault] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash')
  const [promoCode, setPromoCode] = useState('')
  const [promoStatus, setPromoStatus] = useState<'applied' | 'invalid' | null>(null)
  const [promoMessage, setPromoMessage] = useState('')
  const [applyingPromo, setApplyingPromo] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setField(field: keyof AddressForm, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }))
  }

  function selectSaved(saved: SavedAddress) {
    setAddress({
      line1: saved.line1,
      line2: saved.line2 ?? '',
      city: saved.city,
      province: saved.province,
      country: saved.country,
      postal_code: saved.postal_code,
    })
    setShowModal(false)
  }

  async function handleApplyPromo() {
    if (!promoCode.trim()) return
    setApplyingPromo(true)
    setPromoStatus(null)
    setPromoMessage('')
    try {
      const res = await fetch(`/api/promos/validate?code=${promoCode.trim()}`)
      const data = await res.json()
      if (res.ok && data.valid) {
        setPromoStatus('applied')
        setPromoMessage(
          data.type === 'percent'
            ? `${data.value}% discount applied`
            : `₱${data.value} discount applied`
        )
      } else {
        setPromoStatus('invalid')
        setPromoMessage(data.error ?? 'Invalid or expired promo code')
      }
    } catch {
      setPromoStatus('invalid')
      setPromoMessage('Could not validate promo code')
    } finally {
      setApplyingPromo(false)
    }
  }

  function validate(): string | null {
    if (!address.line1.trim()) return 'Street address is required'
    if (!address.city.trim()) return 'City is required'
    if (!address.province.trim()) return 'Province is required'
    if (!address.postal_code.trim()) return 'Postal code is required'
    return null
  }

  const isAddressFilled = !!(
    address.line1.trim() &&
    address.city.trim() &&
    address.province.trim() &&
    address.postal_code.trim()
  )

  const payload = useCallback(() => ({
    address,
    save_address: saveAddress,
    save_as_default: saveAsDefault,
    promo_code: promoCode.trim() || undefined,
  }), [address, saveAddress, saveAsDefault, promoCode])

  async function handleEwallet() {
    const err = validate(); if (err) { setError(err); return }
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/paymongo/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: paymentMethod, ...payload() }),
      })
      const data = await res.json()
      if (!res.ok || !data.checkout_url) throw new Error(data.error ?? 'Failed to initiate payment')
      window.location.href = data.checkout_url
    } catch (e: any) { setError(e.message); setLoading(false) }
  }

  async function handleCOD() {
    const err = validate(); if (err) { setError(err); return }
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/orders/cod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload()),
      })
      const data = await res.json()
      if (!res.ok || !data.order_id) throw new Error(data.error ?? 'Failed to place order')
      await logAction({
        action: 'order_placed', entity: 'orders',
        entityId: data.order_id, entityName: `Order #${data.order_id}`,
        metadata: { payment_method: 'cod' },
      })
      router.push(`/order/${data.order_id}`)
    } catch (e: any) { setError(e.message); setLoading(false) }
  }

  async function handlePaypalSuccess(paypalOrderId: string) {
    setLoading(true); setError(null)
    try {
      const res = await fetch('/api/orders/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paypal_order_id: paypalOrderId, ...payload() }),
      })
      const data = await res.json()
      if (!res.ok || !data.order_id) throw new Error(data.error ?? 'Failed to capture payment')
      router.push(`/order/${data.order_id}`)
    } catch (e: any) { setError(e.message); setLoading(false) }
  }

  // ── Rendered: left column (address + promo) ──
  const leftColumn = (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-brown">Delivery address</p>
        {savedAddresses.length > 0 && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="text-xs text-brown/60 underline underline-offset-2 hover:text-brown transition-colors"
          >
            Use saved address
          </button>
        )}
      </div>

      <div className="space-y-3">
        <input type="text" placeholder="Street address" value={address.line1}
          onChange={(e) => setField('line1', e.target.value)}
          className="w-full rounded-xl border border-whitewash-off bg-white px-4 py-3 text-sm text-brown placeholder:text-brown/40 focus:border-brown focus:outline-none" />
        <input type="text" placeholder="Apt, floor, unit (optional)" value={address.line2}
          onChange={(e) => setField('line2', e.target.value)}
          className="w-full rounded-xl border border-whitewash-off bg-white px-4 py-3 text-sm text-brown placeholder:text-brown/40 focus:border-brown focus:outline-none" />
        <div className="grid grid-cols-2 gap-3">
          <input type="text" placeholder="City" value={address.city}
            onChange={(e) => setField('city', e.target.value)}
            className="w-full rounded-xl border border-whitewash-off bg-white px-4 py-3 text-sm text-brown placeholder:text-brown/40 focus:border-brown focus:outline-none" />
          <input type="text" placeholder="Province" value={address.province}
            onChange={(e) => setField('province', e.target.value)}
            className="w-full rounded-xl border border-whitewash-off bg-white px-4 py-3 text-sm text-brown placeholder:text-brown/40 focus:border-brown focus:outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input type="text" placeholder="Postal code" value={address.postal_code}
            onChange={(e) => setField('postal_code', e.target.value)}
            className="w-full rounded-xl border border-whitewash-off bg-white px-4 py-3 text-sm text-brown placeholder:text-brown/40 focus:border-brown focus:outline-none" />
          <input type="text" value="Philippines" readOnly
            className="w-full rounded-xl border border-whitewash-off bg-whitewash px-4 py-3 text-sm text-brown/50" />
        </div>
      </div>

      {/* Save toggles — appear once address is filled */}
      {isAddressFilled && (
        <div className="space-y-3 rounded-xl border border-whitewash-off bg-whitewash px-4 py-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-brown">Save this address</span>
            <Toggle on={saveAddress} onToggle={() => { setSaveAddress((p) => !p); if (saveAddress) setSaveAsDefault(false) }} />
          </label>
          {saveAddress && (
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-brown/70">Set as default</span>
              <Toggle on={saveAsDefault} onToggle={() => setSaveAsDefault((p) => !p)} />
            </label>
          )}
        </div>
      )}

      {/* Promo code */}
      <div className="border-t border-whitewash-off pt-5">
        <p className="mb-2 text-sm font-medium text-brown">Promo code</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter promo code"
            value={promoCode}
            onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoStatus(null); setPromoMessage('') }}
            disabled={promoStatus === 'applied'}
            className="flex-1 rounded-xl border border-whitewash-off bg-white px-4 py-3 text-sm text-brown placeholder:text-brown/40 focus:border-brown focus:outline-none disabled:opacity-60"
          />
          {promoStatus === 'applied' ? (
            <button
              type="button"
              onClick={() => { setPromoCode(''); setPromoStatus(null); setPromoMessage('') }}
              className="shrink-0 rounded-xl border border-brown/30 px-4 py-3 text-sm text-brown/60 hover:text-brown transition-colors"
            >
              Remove
            </button>
          ) : (
            <button
              type="button"
              onClick={handleApplyPromo}
              disabled={!promoCode.trim() || applyingPromo}
              className="shrink-0 rounded-xl bg-brown px-4 py-3 text-sm font-medium text-white hover:bg-brown-light transition-colors disabled:opacity-40"
            >
              {applyingPromo ? 'Checking…' : 'Apply'}
            </button>
          )}
        </div>
        {promoMessage && (
          <p className={clsx('mt-2 text-xs', promoStatus === 'applied' ? 'text-green-600' : 'text-red-500')}>
            {promoMessage}
          </p>
        )}
      </div>
    </div>
  )

  // ── Rendered: right column (payment + CTA) ──
  const rightColumn = (
    <div className="space-y-4">
      {/* Payment method card */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-brown">Payment</h2>
        <PaymentMethodPicker selected={paymentMethod} onChange={setPaymentMethod} />
      </div>

      {/* CTA card */}
      <div className="rounded-2xl bg-white p-6 shadow-sm space-y-3">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        {paymentMethod === 'gcash' && (
          <button onClick={handleEwallet} disabled={loading}
            className="w-full rounded-full bg-[#007DFF] py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50">
            {loading ? 'Redirecting to GCash…' : 'Pay with GCash'}
          </button>
        )}
        {paymentMethod === 'maya' && (
          <button onClick={handleEwallet} disabled={loading}
            className="w-full rounded-full bg-[#31B057] py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50">
            {loading ? 'Redirecting to Maya…' : 'Pay with Maya'}
          </button>
        )}
        {paymentMethod === 'cod' && (
          <>
            <button onClick={handleCOD} disabled={loading}
              className="w-full rounded-full bg-brown py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50">
              {loading ? 'Placing order…' : 'Place order — Cash on Delivery'}
            </button>
            <p className="text-center text-xs text-brown/50">
              Pay in cash when your order is delivered. Processed within 1–3 business days.
            </p>
          </>
        )}
        {paymentMethod === 'paypal' && (
          !isAddressFilled ? (
            <p className="rounded-xl bg-peach-light px-4 py-3 text-sm text-brown">
              Fill in your delivery address first.
            </p>
          ) : (
            <PayPalButton amount={cartTotal} onSuccess={handlePaypalSuccess} />
          )
        )}

        <p className="text-center text-xs text-brown/40">
          Your order is secured and encrypted.
        </p>
      </div>
    </div>
  )

  return (
    <>
      {/* Two-column layout lives here so both columns share state */}
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[1fr_380px]">
        <div className="rounded-2xl bg-white p-6 shadow-sm">{leftColumn}</div>
        <div className="flex flex-col gap-4">
          {orderSummary}
          {rightColumn}
        </div>
      </div>

      {/* Saved address modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative w-full bg-white sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-whitewash-off px-5 py-4">
              <h2 className="text-base font-medium text-brown">Saved addresses</h2>
              <button onClick={() => setShowModal(false)} className="text-brown/50 hover:text-brown">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-3">
              {savedAddresses.map((addr) => (
                <button key={addr.id} type="button" onClick={() => selectSaved(addr)}
                  className="w-full rounded-xl border border-whitewash-off bg-white px-4 py-3 text-left hover:border-brown hover:bg-peach-light transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-brown">
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}
                      </p>
                      <p className="text-xs text-brown/60">
                        {addr.city}, {addr.province} {addr.postal_code}
                      </p>
                    </div>
                    {addr.is_default && (
                      <span className="shrink-0 rounded-full bg-peach px-2 py-0.5 text-xs text-brown">Default</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
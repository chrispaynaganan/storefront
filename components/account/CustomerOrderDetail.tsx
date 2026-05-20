'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import clsx from 'clsx'

interface Order {
  id: string
  status: string
  subtotal: number
  discount: number
  total: number
  currency: string
  payment_method: string
  courier?: string
  tracking_number?: string
  cancellation_reason?: string
  cancelled_at?: string
  delivered_at?: string
  return_reason?: string
  return_requested_at?: string
  created_at: string
  address: { line1: string; line2?: string; city: string; province: string; postal_code: string; country: string }
  order_items: {
    id: string
    qty: number
    unit_price: number
    line_total: number
    variant: {
      id: string
      size: string
      color: string
      color_hex: string
      product: { id: string; name: string; slug: string; image_urls: string[] }
    }
  }[]
}

const STATUS_FLOW = [
  { key: 'paid',             label: 'Order Placed',     icon: '📦' },
  { key: 'packed',           label: 'Packed',           icon: '📫' },
  { key: 'shipped',          label: 'Shipped',          icon: '🚚' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🛵' },
  { key: 'delivered',        label: 'Delivered',        icon: '✅' },
]

const COURIER_LABELS: Record<string, { label: string; url: string }> = {
  jnt:       { label: 'J&T Express',  url: 'https://www.jtexpress.ph/trajectoryQuery' },
  lbc:       { label: 'LBC',          url: 'https://www.lbcexpress.com/track' },
  flash:     { label: 'Flash Express',url: 'https://www.flashexpress.com.ph/tracking' },
  ninjavan:  { label: 'NinjaVan',     url: 'https://www.ninjavan.co/en-ph/tracking' },
  grab:      { label: 'Grab Express', url: 'https://www.grab.com/ph/' },
  lalamove:  { label: 'Lalamove',     url: 'https://www.lalamove.com/en-ph/' },
  other:     { label: 'Courier',      url: '' },
}

const STATUS_BADGE: Record<string, string> = {
  paid:             'bg-blue-100 text-blue-700',
  packed:           'bg-yellow-100 text-yellow-700',
  shipped:          'bg-indigo-100 text-indigo-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered:        'bg-green-100 text-green-700',
  cancelled:        'bg-red-100 text-red-700',
  return_requested: 'bg-purple-100 text-purple-700',
  refunded:         'bg-gray-100 text-gray-700',
}

const STATUS_LABELS: Record<string, string> = {
  paid:             'Order Placed',
  packed:           'Packed',
  shipped:          'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
  return_requested: 'Return Requested',
  refunded:         'Refunded',
}

function fmt(amount: number) {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function CustomerOrderDetail({ order }: { order: Order }) {
  const router = useRouter()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [returnReason, setReturnReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const currentStepIndex = STATUS_FLOW.findIndex((s) => s.key === order.status)
  const isTerminal = ['cancelled', 'return_requested', 'refunded'].includes(order.status)
  const canCancel = ['paid', 'packed'].includes(order.status)
  const canReturn = order.status === 'delivered'
  const courierInfo = order.courier ? COURIER_LABELS[order.courier] : null

  async function handleCancel() {
    if (!cancelReason.trim()) { setActionError('Please provide a reason'); return }
    setSubmitting(true); setActionError(null)
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to cancel')
      setShowCancelModal(false)
      router.refresh()
    } catch (e: any) {
      setActionError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReturn() {
    if (!returnReason.trim()) { setActionError('Please provide a reason'); return }
    setSubmitting(true); setActionError(null)
    try {
      const res = await fetch(`/api/orders/${order.id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: returnReason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to submit return')
      setShowReturnModal(false)
      router.refresh()
    } catch (e: any) {
      setActionError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <button onClick={() => router.push('/account/orders')}
          className="mb-3 flex items-center gap-1.5 text-sm text-brown/50 hover:text-brown transition-colors">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          My orders
        </button>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-gelasio text-2xl text-brown">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
            <p className="mt-0.5 text-sm text-brown/50">{fmtDate(order.created_at)}</p>
          </div>
          <span className={clsx('rounded-full px-3 py-1 text-xs font-medium shrink-0', STATUS_BADGE[order.status] ?? 'bg-gray-100')}>
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
        </div>
      </div>

      {/* Status timeline */}
      {!isTerminal && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center">
            {STATUS_FLOW.map((step, i) => {
              const done = i <= currentStepIndex
              const current = i === currentStepIndex
              return (
                <div key={step.key} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div className={clsx(
                      'flex h-9 w-9 items-center justify-center rounded-full text-sm transition-all',
                      done ? 'bg-brown text-white' : 'bg-whitewash-off text-brown/30',
                      current && 'ring-2 ring-brown ring-offset-2'
                    )}>{step.icon}</div>
                    <span className={clsx('text-center text-xs leading-tight', done ? 'font-medium text-brown' : 'text-brown/40')}>
                      {step.label}
                    </span>
                  </div>
                  {i < STATUS_FLOW.length - 1 && (
                    <div className={clsx('h-0.5 flex-1 mb-5', i < currentStepIndex ? 'bg-brown' : 'bg-whitewash-off')} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Terminal notice */}
      {isTerminal && (
        <div className={clsx('rounded-2xl p-5',
          order.status === 'cancelled' && 'bg-red-50 border border-red-100',
          order.status === 'return_requested' && 'bg-purple-50 border border-purple-100',
          order.status === 'refunded' && 'bg-gray-50 border border-gray-100',
        )}>
          <p className="font-medium text-sm text-brown">
            {order.status === 'cancelled' && '❌ This order has been cancelled'}
            {order.status === 'return_requested' && '↩️ Return request submitted — we\'ll contact you within 2–3 business days'}
            {order.status === 'refunded' && '💸 This order has been refunded'}
          </p>
          {(order.cancellation_reason || order.return_reason) && (
            <p className="mt-1 text-xs text-brown/60">Reason: {order.cancellation_reason ?? order.return_reason}</p>
          )}
        </div>
      )}

      {/* Tracking */}
      {order.tracking_number && courierInfo && (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-brown">Tracking</h2>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-brown">{courierInfo.label}</p>
              <p className="text-sm text-brown/60 font-mono">{order.tracking_number}</p>
            </div>
            {courierInfo.url && (
              <a href={courierInfo.url} target="_blank" rel="noopener noreferrer"
                className="shrink-0 rounded-full border border-brown px-4 py-2 text-xs font-medium text-brown hover:bg-peach-light transition-colors">
                Track →
              </a>
            )}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-brown">Items</h2>
        <div className="divide-y divide-whitewash-off">
          {order.order_items.map((item) => {
            const product = item.variant.product
            const imageUrl = product.image_urls?.[0]
            return (
              <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-whitewash-off">
                  {imageUrl
                    ? <Image src={imageUrl} alt={product.name} width={64} height={64} className="h-full w-full object-cover" />
                    : <div className="h-full w-full flex items-center justify-center text-brown/20">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                  }
                </div>
                <div className="flex flex-1 items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-brown">{product.name}</p>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="text-xs text-brown/50">Size {item.variant.size}</span>
                      <span className="text-brown/20">·</span>
                      <span className="flex items-center gap-1 text-xs text-brown/50">
                        <span className="h-3 w-3 rounded-full border border-brown/10" style={{ backgroundColor: item.variant.color_hex }} />
                        {item.variant.color}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-brown">{fmt(item.line_total)}</p>
                    <p className="text-xs text-brown/50">{fmt(item.unit_price)} × {item.qty}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 space-y-1.5 border-t border-whitewash-off pt-4">
          <div className="flex justify-between text-sm text-brown/70"><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>−{fmt(order.discount)}</span></div>
          )}
          <div className="flex justify-between text-base font-medium text-brown"><span>Total</span><span>{fmt(order.total)}</span></div>
        </div>
      </div>

      {/* Address */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-brown">Deliver to</h2>
        <p className="text-sm text-brown">{order.address.line1}</p>
        {order.address.line2 && <p className="text-sm text-brown">{order.address.line2}</p>}
        <p className="text-sm text-brown">{order.address.city}, {order.address.province} {order.address.postal_code}</p>
      </div>

      {/* Actions */}
      {(canCancel || canReturn) && (
        <div className="rounded-2xl bg-white p-5 shadow-sm space-y-3">
          {canCancel && (
            <div>
              <button onClick={() => { setShowCancelModal(true); setActionError(null) }}
                className="w-full rounded-full border border-red-200 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                Cancel order
              </button>
              <p className="mt-1.5 text-center text-xs text-brown/40">Orders can only be cancelled before they are shipped.</p>
            </div>
          )}
          {canReturn && (
            <div>
              <button onClick={() => { setShowReturnModal(true); setActionError(null) }}
                className="w-full rounded-full border border-brown/30 py-2.5 text-sm text-brown hover:bg-peach-light transition-colors">
                Request return / refund
              </button>
              <p className="mt-1.5 text-center text-xs text-brown/40">Returns accepted within 7 days of delivery.</p>
            </div>
          )}
        </div>
      )}

      {/* Cancel modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCancelModal(false)} />
          <div className="relative w-full bg-white sm:max-w-md rounded-2xl p-6 shadow-xl">
            <h2 className="font-gelasio text-lg text-brown mb-1">Cancel order?</h2>
            <p className="text-sm text-brown/60 mb-4">Please tell us why you're cancelling. Your items will be restocked.</p>
            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation…" rows={3}
              className="w-full rounded-xl border border-whitewash-off px-4 py-3 text-sm text-brown placeholder:text-brown/40 focus:border-brown focus:outline-none resize-none" />
            {actionError && <p className="mt-2 text-xs text-red-500">{actionError}</p>}
            <div className="mt-4 flex gap-3">
              <button onClick={() => setShowCancelModal(false)}
                className="flex-1 rounded-full border border-brown/20 py-2.5 text-sm text-brown hover:bg-whitewash transition-colors">
                Keep order
              </button>
              <button onClick={handleCancel} disabled={submitting}
                className="flex-1 rounded-full bg-red-500 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50">
                {submitting ? 'Cancelling…' : 'Cancel order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowReturnModal(false)} />
          <div className="relative w-full bg-white sm:max-w-md rounded-2xl p-6 shadow-xl">
            <h2 className="font-gelasio text-lg text-brown mb-1">Request a return</h2>
            <p className="text-sm text-brown/60 mb-4">Describe the issue and our team will get back to you within 2–3 business days.</p>
            <textarea value={returnReason} onChange={(e) => setReturnReason(e.target.value)}
              placeholder="e.g. Wrong size received, item damaged…" rows={3}
              className="w-full rounded-xl border border-whitewash-off px-4 py-3 text-sm text-brown placeholder:text-brown/40 focus:border-brown focus:outline-none resize-none" />
            {actionError && <p className="mt-2 text-xs text-red-500">{actionError}</p>}
            <div className="mt-4 flex gap-3">
              <button onClick={() => setShowReturnModal(false)}
                className="flex-1 rounded-full border border-brown/20 py-2.5 text-sm text-brown hover:bg-whitewash transition-colors">
                Cancel
              </button>
              <button onClick={handleReturn} disabled={submitting}
                className="flex-1 rounded-full bg-brown py-2.5 text-sm font-medium text-white hover:bg-brown-light transition-colors disabled:opacity-50">
                {submitting ? 'Submitting…' : 'Submit request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
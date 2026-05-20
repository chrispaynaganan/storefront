'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import clsx from 'clsx'
import { logAction } from '@/lib/log-client'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Order {
  id: string
  status: string
  subtotal: number
  discount: number
  total: number
  currency: string
  payment_method: string
  paypal_order_id?: string
  paymongo_payment_id?: string
  courier?: string
  tracking_number?: string
  cancellation_reason?: string
  cancelled_at?: string
  delivered_at?: string
  return_reason?: string
  return_requested_at?: string
  created_at: string
  user: { id: string; full_name?: string; first_name?: string; last_name?: string; email: string }
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
      sku?: string
      product: { id: string; name: string; slug: string; image_urls: string[] }
    }
  }[]
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_FLOW = [
  { key: 'paid',            label: 'Order Placed',      icon: '📦' },
  { key: 'packed',          label: 'Packed',            icon: '📫' },
  { key: 'shipped',         label: 'Shipped',           icon: '🚚' },
  { key: 'out_for_delivery',label: 'Out for Delivery',  icon: '🛵' },
  { key: 'delivered',       label: 'Delivered',         icon: '✅' },
]

const ALL_STATUSES = [
  { key: 'paid',             label: 'Order Placed' },
  { key: 'packed',           label: 'Packed' },
  { key: 'shipped',          label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered',        label: 'Delivered' },
  { key: 'cancelled',        label: 'Cancelled' },
  { key: 'return_requested', label: 'Return Requested' },
  { key: 'refunded',         label: 'Refunded' },
]

const COURIERS = [
  { key: 'jnt',          label: 'J&T Express',   url: 'https://www.jtexpress.ph/trajectoryQuery' },
  { key: 'lbc',          label: 'LBC',            url: 'https://www.lbcexpress.com/track' },
  { key: 'flash',        label: 'Flash Express',  url: 'https://www.flashexpress.com.ph/tracking' },
  { key: 'ninjavan',     label: 'NinjaVan',       url: 'https://www.ninjavan.co/en-ph/tracking' },
  { key: 'grab',         label: 'Grab Express',   url: 'https://www.grab.com/ph/' },
  { key: 'lalamove',     label: 'Lalamove',       url: 'https://www.lalamove.com/en-ph/' },
  { key: 'other',        label: 'Other',          url: '' },
]

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

function fmt(amount: number) {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminOrderDetail({ order }: { order: Order }) {
  const router = useRouter()
  const [status, setStatus] = useState(order.status)
  const [courier, setCourier] = useState(order.courier ?? '')
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number ?? '')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const customerName =
    order.user.first_name
      ? `${order.user.first_name} ${order.user.last_name ?? ''}`.trim()
      : order.user.full_name ?? order.user.email

  const currentStepIndex = STATUS_FLOW.findIndex((s) => s.key === status)
  const isTerminal = ['cancelled', 'return_requested', 'refunded'].includes(status)

  async function handleSave() {
    setSaving(true)
    setSaveMsg(null)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, courier: courier || null, tracking_number: trackingNumber || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to update')
      setSaveMsg({ type: 'success', text: 'Order updated successfully' })
      await logAction({
        action: 'order_updated',
        entity: 'orders',
        entityId: order.id,
        entityName: `Order #${order.id.slice(0, 8)}`,
        metadata: { status, courier, tracking_number: trackingNumber },
      })
      router.refresh()
    } catch (e: any) {
      setSaveMsg({ type: 'error', text: e.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-whitewash">
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <button
              onClick={() => router.push('/admin/orders')}
              className="mb-2 flex items-center gap-1.5 text-sm text-brown/50 hover:text-brown transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              All orders
            </button>
            <h1 className="font-gelasio text-2xl text-brown">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="mt-1 text-sm text-brown/50">{fmtDate(order.created_at)}</p>
          </div>
          <span className={clsx('rounded-full px-3 py-1 text-xs font-medium', STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-600')}>
            {ALL_STATUSES.find((s) => s.key === status)?.label ?? status}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">

            {/* Status timeline */}
            {!isTerminal && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-xs font-medium uppercase tracking-widest text-brown">Order Progress</h2>
                <div className="flex items-center gap-0">
                  {STATUS_FLOW.map((step, i) => {
                    const done = i <= currentStepIndex
                    const current = i === currentStepIndex
                    return (
                      <div key={step.key} className="flex flex-1 items-center">
                        <div className="flex flex-col items-center gap-1.5 flex-1">
                          <div className={clsx(
                            'flex h-9 w-9 items-center justify-center rounded-full text-base transition-all',
                            done ? 'bg-brown text-white' : 'bg-whitewash-off text-brown/30',
                            current && 'ring-2 ring-brown ring-offset-2'
                          )}>
                            {step.icon}
                          </div>
                          <span className={clsx(
                            'text-center text-xs leading-tight',
                            done ? 'font-medium text-brown' : 'text-brown/40'
                          )}>
                            {step.label}
                          </span>
                        </div>
                        {i < STATUS_FLOW.length - 1 && (
                          <div className={clsx(
                            'h-0.5 flex-1 mb-5 transition-colors',
                            i < currentStepIndex ? 'bg-brown' : 'bg-whitewash-off'
                          )} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Cancelled / return / refund notice */}
            {isTerminal && (
              <div className={clsx(
                'rounded-2xl p-5',
                status === 'cancelled' && 'bg-red-50 border border-red-100',
                status === 'return_requested' && 'bg-purple-50 border border-purple-100',
                status === 'refunded' && 'bg-gray-50 border border-gray-100',
              )}>
                <p className="font-medium text-sm text-brown">
                  {status === 'cancelled' && '❌ Order Cancelled'}
                  {status === 'return_requested' && '↩️ Return Requested'}
                  {status === 'refunded' && '💸 Refunded'}
                </p>
                {order.cancellation_reason && (
                  <p className="mt-1 text-xs text-brown/60">Reason: {order.cancellation_reason}</p>
                )}
                {order.return_reason && (
                  <p className="mt-1 text-xs text-brown/60">Reason: {order.return_reason}</p>
                )}
                {order.cancelled_at && (
                  <p className="mt-1 text-xs text-brown/40">{fmtDate(order.cancelled_at)}</p>
                )}
                {order.return_requested_at && (
                  <p className="mt-1 text-xs text-brown/40">{fmtDate(order.return_requested_at)}</p>
                )}
              </div>
            )}

            {/* Order items */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-brown">Items</h2>
              <div className="divide-y divide-whitewash-off">
                {order.order_items.map((item) => {
                  const product = item.variant.product
                  const imageUrl = product.image_urls?.[0]
                  return (
                    <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-whitewash-off">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-brown/20">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-brown">{product.name}</p>
                          <div className="mt-0.5 flex items-center gap-2">
                            <span className="text-xs text-brown/50">Size {item.variant.size}</span>
                            <span className="text-brown/20">·</span>
                            <span className="flex items-center gap-1 text-xs text-brown/50">
                              <span
                                className="h-3 w-3 rounded-full border border-brown/10"
                                style={{ backgroundColor: item.variant.color_hex }}
                              />
                              {item.variant.color}
                            </span>
                          </div>
                          {item.variant.sku && (
                            <p className="mt-0.5 text-xs text-brown/30">SKU: {item.variant.sku}</p>
                          )}
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

              {/* Totals */}
              <div className="mt-4 space-y-1.5 border-t border-whitewash-off pt-4">
                <div className="flex justify-between text-sm text-brown/70">
                  <span>Subtotal</span>
                  <span>{fmt(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>−{fmt(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-medium text-brown">
                  <span>Total</span>
                  <span>{fmt(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">

            {/* Customer */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-brown">Customer</h2>
              <p className="text-sm font-medium text-brown">{customerName}</p>
              <p className="text-xs text-brown/50">{order.user.email}</p>
            </div>

            {/* Shipping address */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-brown">Ship to</h2>
              <p className="text-sm text-brown">{order.address.line1}</p>
              {order.address.line2 && <p className="text-sm text-brown">{order.address.line2}</p>}
              <p className="text-sm text-brown">
                {order.address.city}, {order.address.province} {order.address.postal_code}
              </p>
              <p className="text-sm text-brown">{order.address.country}</p>
            </div>

            {/* Payment */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-xs font-medium uppercase tracking-widest text-brown">Payment</h2>
              <p className="text-sm font-medium text-brown capitalize">
                {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
              </p>
              {(order.paymongo_payment_id || order.paypal_order_id) && (
                <p className="mt-0.5 text-xs text-brown/40 break-all">
                  Ref: {order.paymongo_payment_id ?? order.paypal_order_id}
                </p>
              )}
            </div>

            {/* Status + Tracking updater */}
            <div className="rounded-2xl bg-white p-5 shadow-sm space-y-4">
              <h2 className="text-xs font-medium uppercase tracking-widest text-brown">Update Order</h2>

              {/* Status */}
              <div>
                <label className="mb-1.5 block text-xs text-brown/60">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-whitewash-off bg-white px-3 py-2.5 text-sm text-brown focus:border-brown focus:outline-none"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Courier */}
              <div>
                <label className="mb-1.5 block text-xs text-brown/60">Courier</label>
                <select
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  className="w-full rounded-xl border border-whitewash-off bg-white px-3 py-2.5 text-sm text-brown focus:border-brown focus:outline-none"
                >
                  <option value="">— Select courier —</option>
                  {COURIERS.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Tracking number */}
              <div>
                <label className="mb-1.5 block text-xs text-brown/60">Tracking number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. 123456789"
                  className="w-full rounded-xl border border-whitewash-off bg-white px-3 py-2.5 text-sm text-brown placeholder:text-brown/30 focus:border-brown focus:outline-none"
                />
              </div>

              {saveMsg && (
                <p className={clsx(
                  'rounded-xl px-3 py-2 text-xs',
                  saveMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                )}>
                  {saveMsg.text}
                </p>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-full bg-brown py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
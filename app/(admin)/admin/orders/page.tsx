'use client'

// app/(admin)/admin/orders/page.tsx

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatPrice, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Order {
  id: string
  status: string
  subtotal: number
  discount: number
  total: number
  currency: string
  created_at: string
  users: { full_name: string | null; email: string } | null
  addresses: { city: string; country: string } | null
}

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-yellow-50 text-yellow-700 border border-yellow-200',
  paid:       'bg-blue-50 text-blue-700 border border-blue-200',
  processing: 'bg-blue-50 text-blue-700 border border-blue-200',
  shipped:    'bg-purple-50 text-purple-700 border border-purple-200',
  delivered:  'bg-green-50 text-green-700 border border-green-200',
  cancelled:  'bg-red-50 text-red-700 border border-red-200',
}

// ─── Shared components ────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-brown/70 font-medium">{label}</label>
      {children}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize', STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600')}>
      {status}
    </span>
  )
}

function EditBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-brown/50 hover:text-brown">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
    </button>
  )
}

// ─── Update status modal ──────────────────────────────────────────────────────

function UpdateStatusModal({ order, onClose, onSaved }: { order: Order; onClose: () => void; onSaved: () => void }) {
  const supabase = createClient()
  const [status, setStatus] = useState(order.status)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await supabase.from('orders').update({ status }).eq('id', order.id)
    setSaving(false)
    onSaved(); onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[90dvh]">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-brown">Update Order</h2>
            <p className="text-xs text-brown/40 mt-0.5 font-mono">{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
            <svg className="w-5 h-5 text-brown/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-5">
          {/* Order summary */}
          <div className="bg-whitewash rounded-2xl p-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between"><span className="text-brown/50">Customer</span><span className="font-semibold text-brown">{order.users?.full_name ?? order.users?.email ?? 'Guest'}</span></div>
            <div className="flex justify-between"><span className="text-brown/50">Total</span><span className="font-semibold text-brown">{formatPrice(order.total)}</span></div>
            <div className="flex justify-between"><span className="text-brown/50">Date</span><span className="text-brown/70">{formatDate(order.created_at)}</span></div>
          </div>

          <Field label="Status">
            <div className="relative">
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full appearance-none bg-gray-100 rounded-2xl px-4 py-3 text-sm text-brown outline-none focus:ring-2 focus:ring-peach transition pr-10 capitalize"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </Field>

          <button onClick={handleSave} disabled={saving} className="w-full bg-brown-light text-white font-semibold rounded-2xl py-3.5 flex items-center justify-center gap-2 hover:bg-brown transition disabled:opacity-50">
            {saving
              ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              : null}
            Update Status
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [editOrder, setEditOrder] = useState<Order | undefined>()
  const PER_PAGE = 15

  async function load() {
    setLoading(true)
    const from = (page - 1) * PER_PAGE
    let query = supabase
      .from('orders')
      .select('id, status, subtotal, discount, total, currency, created_at, users(full_name, email), addresses(city, country)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + PER_PAGE - 1)

    if (filterStatus !== 'all') query = query.eq('status', filterStatus)

    const { data, count } = await query
    setOrders((data as unknown as Order[]) ?? [])
    setTotal(count ?? 0)
    setLoading(false)
  }

  useEffect(() => { load() }, [page, filterStatus])

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="px-5 py-8 md:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-brown tracking-tight">Orders</h1>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {['all', ...STATUSES].map(s => (
          <button
            key={s}
            onClick={() => { setFilterStatus(s); setPage(1) }}
            className={cn(
              'shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition capitalize',
              filterStatus === s ? 'bg-brown text-white' : 'bg-white border border-whitewash-off text-brown/60 hover:border-peach',
            )}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-brown/40 text-sm">No orders found.</div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-4">
            {orders.map(o => (
              <div key={o.id} className="bg-white rounded-2xl border border-whitewash-off p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-brown truncate">{o.users?.full_name ?? o.users?.email ?? 'Guest'}</p>
                    <p className="text-xs text-brown/40 font-mono mt-0.5">{o.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={o.status} />
                    <EditBtn onClick={() => setEditOrder(o)} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-50">
                  <div><p className="text-xs text-brown/40">Total</p><p className="text-sm font-semibold text-brown">{formatPrice(o.total)}</p></div>
                  <div><p className="text-xs text-brown/40">Date</p><p className="text-sm font-semibold text-brown">{formatDate(o.created_at)}</p></div>
                  <div><p className="text-xs text-brown/40">Location</p><p className="text-sm font-semibold text-brown truncate">{o.addresses?.city ?? '—'}</p></div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <div className="rounded-2xl border border-whitewash-off overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-whitewash-off">
                    {['Order', 'Customer', 'Date', 'Total', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-brown/40 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o, i) => (
                    <tr key={o.id} className={cn('border-b border-whitewash-off last:border-0', i % 2 === 0 ? 'bg-white' : 'bg-whitewash/40')}>
                      <td className="px-5 py-4 font-mono text-xs text-brown/60">{o.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-brown">{o.users?.full_name ?? 'Guest'}</p>
                        <p className="text-xs text-brown/40">{o.users?.email}</p>
                      </td>
                      <td className="px-5 py-4 text-brown/70">{formatDate(o.created_at)}</td>
                      <td className="px-5 py-4 font-semibold text-brown">{formatPrice(o.total)}</td>
                      <td className="px-5 py-4"><StatusBadge status={o.status} /></td>
                      <td className="px-5 py-4"><EditBtn onClick={() => setEditOrder(o)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 text-sm text-brown/50">
                <span>Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-white border border-whitewash-off disabled:opacity-30 transition">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg> Previous
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-white border border-whitewash-off disabled:opacity-30 transition">
                    Next <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {editOrder && <UpdateStatusModal order={editOrder} onClose={() => setEditOrder(undefined)} onSaved={load} />}
    </div>
  )
}
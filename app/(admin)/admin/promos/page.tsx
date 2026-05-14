'use client'

// app/(admin)/admin/promos/page.tsx

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { logAction, buildDiff } from '@/lib/log-client'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product { id: string; name: string }

interface Promo {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
  product_id: string | null
  products: { name: string } | null
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

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full bg-gray-100 rounded-2xl px-4 py-3 text-sm text-brown placeholder:text-brown/30 outline-none focus:ring-2 focus:ring-peach transition" />
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className="w-full appearance-none bg-gray-100 rounded-2xl px-4 py-3 text-sm text-brown outline-none focus:ring-2 focus:ring-peach transition pr-10" />
      <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
    </div>
  )
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold', active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
      {active ? 'Active' : 'Inactive'}
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

function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition text-red-400 hover:text-red-600">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
    </button>
  )
}

// ─── Promo modal ──────────────────────────────────────────────────────────────

function PromoModal({ mode, promo, products, onClose, onSaved }: {
  mode: 'add' | 'edit'
  promo?: Promo
  products: Product[]
  onClose: () => void
  onSaved: () => void
}) {
  const supabase = createClient()
  const [code, setCode] = useState(promo?.code ?? '')
  const [type, setType] = useState<'percentage' | 'fixed'>(promo?.type ?? 'percentage')
  const [value, setValue] = useState(String(promo?.value ?? ''))
  const [productId, setProductId] = useState(promo?.product_id ?? '')
  const [startsAt, setStartsAt] = useState(promo?.starts_at ? promo.starts_at.slice(0, 10) : '')
  const [endsAt, setEndsAt] = useState(promo?.ends_at ? promo.ends_at.slice(0, 10) : '')
  const [isActive, setIsActive] = useState(promo?.is_active ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!code || !value) { setError('Code and value are required.'); return }
    setSaving(true); setError('')
    try {
      const payload = {
        code: code.toUpperCase().trim(),
        type, value: parseFloat(value),
        product_id: productId || null,
        starts_at: startsAt || null,
        ends_at: endsAt || null,
        is_active: isActive,
      }
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from('users').select('full_name, role').eq('id', user?.id ?? '').single()

      if (mode === 'add') {
        const { data: newPromo, error: e } = await supabase
          .from('promos').insert(payload).select('id').single()
        if (e) throw e
        await logAction({
          userId: user?.id, userName: profile?.full_name ?? user?.email, userRole: profile?.role,
          action: 'created', entity: 'promo', entityId: newPromo?.id, entityName: code.toUpperCase(),
          metadata: { type, value: parseFloat(value), is_active: isActive },
        })
      } else {
        const { error: e } = await supabase.from('promos').update(payload).eq('id', promo!.id)
        if (e) throw e
        const before: Record<string, any> = {
          code: promo!.code, type: promo!.type, value: promo!.value,
          is_active: promo!.is_active, ends_at: promo!.ends_at,
        }
        const after: Record<string, any> = {
          code: code.toUpperCase(), type, value: parseFloat(value),
          is_active: isActive, ends_at: endsAt || null,
        }
        await logAction({
          userId: user?.id, userName: profile?.full_name ?? user?.email, userRole: profile?.role,
          action: 'updated', entity: 'promo', entityId: promo!.id, entityName: code.toUpperCase(),
          changes: buildDiff(before, after),
        })
      }
      onSaved(); onClose()
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[90dvh] sm:max-h-[85vh]">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <h2 className="text-2xl font-bold text-brown">{mode === 'add' ? 'Add Promo' : 'Edit Promo'}</h2>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
            <svg className="w-5 h-5 text-brown/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-5">
          <Field label="Promo Code">
            <TextInput placeholder="SUMMER20" value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="uppercase" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <SelectInput value={type} onChange={e => setType(e.target.value as 'percentage' | 'fixed')}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (PHP)</option>
              </SelectInput>
            </Field>
            <Field label={type === 'percentage' ? 'Discount (%)' : 'Discount (PHP)'}>
              <TextInput type="number" placeholder="20" value={value} onChange={e => setValue(e.target.value)} />
            </Field>
          </div>

          <Field label="Applies to Product (optional)">
            <SelectInput value={productId} onChange={e => setProductId(e.target.value)}>
              <option value="">All products</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </SelectInput>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Starts">
              <TextInput type="date" value={startsAt} onChange={e => setStartsAt(e.target.value)} />
            </Field>
            <Field label="Expires">
              <TextInput type="date" value={endsAt} onChange={e => setEndsAt(e.target.value)} />
            </Field>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="accent-brown w-4 h-4" />
            <span className="text-sm text-brown/70">Active</span>
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}
          <button onClick={handleSave} disabled={saving} className="w-full bg-brown-light text-white font-semibold rounded-2xl py-3.5 flex items-center justify-center gap-2 hover:bg-brown transition disabled:opacity-50">
            {saving ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> : null}
            {mode === 'add' ? 'Add Promo' : 'Update Promo'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteConfirmModal({ code, onConfirm, onClose }: { code: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-brown">Delete promo?</h3>
        <p className="text-sm text-brown/60">Promo code <span className="font-semibold text-brown font-mono">{code}</span> will be permanently deleted.</p>
        <div className="flex gap-3 mt-2">
          <button onClick={onClose} className="flex-1 bg-gray-100 text-brown font-semibold rounded-2xl py-3 hover:bg-gray-200 transition text-sm">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-red-500 text-white font-semibold rounded-2xl py-3 hover:bg-red-600 transition text-sm">Delete</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminPromosPage() {
  const supabase = createClient()
  const [promos, setPromos] = useState<Promo[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<null | 'add' | 'edit'>(null)
  const [editItem, setEditItem] = useState<Promo | undefined>()
  const [deleteItem, setDeleteItem] = useState<Promo | undefined>()

  async function load() {
    setLoading(true)
    const [{ data: p }, { data: prods }] = await Promise.all([
      supabase.from('promos').select('*, products(name)').order('created_at', { ascending: false }),
      supabase.from('products').select('id, name').eq('is_active', true).order('name'),
    ])
    setPromos((p as unknown as Promo[]) ?? [])
    setProducts((prods as Product[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(promo: Promo) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('users').select('full_name, role').eq('id', user?.id ?? '').single()
    await supabase.from('promos').delete().eq('id', promo.id)
    await logAction({
      userId: user?.id, userName: profile?.full_name ?? user?.email, userRole: profile?.role,
      action: 'deleted', entity: 'promo', entityId: promo.id, entityName: promo.code,
    })
    setDeleteItem(undefined)
    load()
  }

  return (
    <div className="px-5 py-8 md:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-brown tracking-tight">Promos</h1>
        <button onClick={() => { setEditItem(undefined); setModal('add') }} className="md:hidden w-12 h-12 rounded-2xl border-2 border-brown flex items-center justify-center hover:bg-brown hover:text-white transition">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        </button>
        <button onClick={() => { setEditItem(undefined); setModal('add') }} className="hidden md:flex items-center gap-2 border-2 border-brown text-brown font-semibold rounded-2xl px-5 py-2.5 text-sm hover:bg-brown hover:text-white transition">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Promo
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />)}</div>
      ) : promos.length === 0 ? (
        <div className="text-center py-20 text-brown/40 text-sm">No promos yet.</div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-4">
            {promos.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-whitewash-off p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono font-bold text-brown text-lg tracking-wide">{p.code}</span>
                  <div className="flex items-center gap-2">
                    <ActiveBadge active={p.is_active} />
                    <EditBtn onClick={() => { setEditItem(p); setModal('edit') }} />
                    <DeleteBtn onClick={() => setDeleteItem(p)} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-50">
                  <div><p className="text-xs text-brown/40">Type</p><p className="text-sm font-semibold text-brown capitalize">{p.type}</p></div>
                  <div><p className="text-xs text-brown/40">Value</p><p className="text-sm font-semibold text-brown">{p.type === 'percentage' ? `${p.value}%` : `₱${p.value}`}</p></div>
                  <div><p className="text-xs text-brown/40">Applies to</p><p className="text-sm font-semibold text-brown truncate">{p.products?.name ?? 'All'}</p></div>
                </div>
                {p.ends_at && <p className="text-xs text-brown/40">Expires {formatDate(p.ends_at)}</p>}
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block rounded-2xl border border-whitewash-off overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-whitewash-off">
                  {['Code', 'Type', 'Value', 'Applies to', 'Expires', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-brown/40 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {promos.map((p, i) => (
                  <tr key={p.id} className={cn('border-b border-whitewash-off last:border-0', i % 2 === 0 ? 'bg-white' : 'bg-whitewash/40')}>
                    <td className="px-5 py-4 font-mono font-semibold text-brown">{p.code}</td>
                    <td className="px-5 py-4 text-brown capitalize">{p.type}</td>
                    <td className="px-5 py-4 text-brown">{p.type === 'percentage' ? `${p.value}%` : `₱${p.value}`}</td>
                    <td className="px-5 py-4 text-brown">{p.products?.name ?? 'All products'}</td>
                    <td className="px-5 py-4 text-brown/60">{p.ends_at ? formatDate(p.ends_at) : '—'}</td>
                    <td className="px-5 py-4"><ActiveBadge active={p.is_active} /></td>
                    <td className="px-5 py-4"><div className="flex gap-2"><EditBtn onClick={() => { setEditItem(p); setModal('edit') }} /><DeleteBtn onClick={() => setDeleteItem(p)} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {modal && <PromoModal mode={modal} promo={editItem} products={products} onClose={() => setModal(null)} onSaved={load} />}
      {deleteItem && <DeleteConfirmModal code={deleteItem.code} onConfirm={() => handleDelete(deleteItem)} onClose={() => setDeleteItem(undefined)} />}
    </div>
  )
}
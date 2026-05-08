'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  // form fields
  const [code, setCode] = useState('')
  const [type, setType] = useState<'percent' | 'fixed'>('percent')
  const [value, setValue] = useState('')
  const [productId, setProductId] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [isActive, setIsActive] = useState(true)

  async function load() {
    const supabase = createClient()
    const { data: p } = await supabase
      .from('promos')
      .select('*, product:products(name)')
      .order('created_at', { ascending: false })
    const { data: prods } = await supabase
      .from('products')
      .select('id, name')
      .eq('is_active', true)
    setPromos(p ?? [])
    setProducts(prods ?? [])
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setEditing(null)
    setCode(''); setType('percent'); setValue('')
    setProductId(''); setStartsAt(''); setEndsAt(''); setIsActive(true)
    setShowForm(true)
  }

  function openEdit(promo: any) {
    setEditing(promo)
    setCode(promo.code); setType(promo.type); setValue(String(promo.value))
    setProductId(promo.product_id ?? ''); setIsActive(promo.is_active)
    setStartsAt(promo.starts_at ? promo.starts_at.slice(0, 16) : '')
    setEndsAt(promo.ends_at ? promo.ends_at.slice(0, 16) : '')
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const data = {
      code: code.toUpperCase(),
      type,
      value: parseFloat(value),
      product_id: productId || null,
      starts_at: startsAt || null,
      ends_at: endsAt || null,
      is_active: isActive,
    }
    if (editing) {
      await supabase.from('promos').update(data).eq('id', editing.id)
    } else {
      await supabase.from('promos').insert(data)
    }
    await load()
    setShowForm(false)
    setSaving(false)
  }

  async function toggleActive(id: string, current: boolean) {
    const supabase = createClient()
    await supabase.from('promos').update({ is_active: !current }).eq('id', id)
    await load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this promo?')) return
    const supabase = createClient()
    await supabase.from('promos').delete().eq('id', id)
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light text-[#3B1F0E]">Promos & discounts</h1>
          <p className="text-sm text-[#6B3A22] mt-1">{promos.length} total</p>
        </div>
        <Button onClick={openNew}
          className="bg-[#3B1F0E] text-white hover:bg-[#6B3A22] rounded-lg px-5 py-2.5 text-sm">
          + Add promo
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-[#FFE8D6] p-6 mb-8 max-w-2xl">
          <h2 className="text-sm font-medium text-[#3B1F0E] mb-4">
            {editing ? `Edit — ${editing.code}` : 'New promo code'}
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Promo code"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="SUMMER20"
            />

            {/* Type selector */}
            <div>
              <p className="text-sm text-[#3B1F0E] mb-1.5">Discount type</p>
              <div className="flex gap-3">
                {(['percent', 'fixed'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                      type === t
                        ? 'bg-[#3B1F0E] text-white border-[#3B1F0E]'
                        : 'border-[#FFE8D6] text-[#6B3A22] hover:border-[#FFCBA4]'
                    }`}
                  >
                    {t === 'percent' ? 'Percentage (%)' : 'Fixed amount (₱)'}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label={type === 'percent' ? 'Discount %' : 'Discount amount (₱)'}
              type="number"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={type === 'percent' ? '20' : '150'}
            />

            {/* Apply to specific product */}
            <div>
              <p className="text-sm text-[#3B1F0E] mb-1.5">Apply to (optional)</p>
              <select
                value={productId}
                onChange={e => setProductId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-[#FFE8D6] bg-white text-sm text-[#3B1F0E] focus:outline-none focus:ring-2 focus:ring-[#FFCBA4]"
              >
                <option value="">All products (site-wide)</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Starts at (optional)"
                type="datetime-local"
                value={startsAt}
                onChange={e => setStartsAt(e.target.value)}
              />
              <Input
                label="Ends at (optional)"
                type="datetime-local"
                value={endsAt}
                onChange={e => setEndsAt(e.target.value)}
              />
            </div>

            <Toggle checked={isActive} onChange={setIsActive} label="Active" />

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}
                className="bg-[#3B1F0E] text-white hover:bg-[#6B3A22] px-6 py-2.5 rounded-lg">
                {saving ? 'Saving...' : editing ? 'Save changes' : 'Add promo'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}
                className="border-[#3B1F0E] text-[#3B1F0E] px-6 py-2.5 rounded-lg">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Promos table */}
      <div className="bg-white rounded-xl border border-[#FFE8D6] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAF7F4] border-b border-[#FFE8D6]">
            <tr>
              {['Code', 'Type', 'Value', 'Applies to', 'Expires', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left text-xs text-[#6B3A22] font-medium px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#FFE8D6]">
            {promos.map(promo => (
              <tr key={promo.id} className="hover:bg-[#FAF7F4] transition-colors">
                <td className="px-5 py-4">
                  <span className="font-mono font-medium text-[#3B1F0E] bg-[#F2EDE8] px-2 py-1 rounded">
                    {promo.code}
                  </span>
                </td>
                <td className="px-5 py-4 text-[#6B3A22]">
                  {promo.type === 'percent' ? 'Percentage' : 'Fixed'}
                </td>
                <td className="px-5 py-4 text-[#3B1F0E] font-medium">
                  {promo.type === 'percent' ? `${promo.value}%` : `₱${promo.value}`}
                </td>
                <td className="px-5 py-4 text-[#6B3A22]">
                  {promo.product?.name ?? 'All products'}
                </td>
                <td className="px-5 py-4 text-[#6B3A22]">
                  {promo.ends_at ? formatDate(promo.ends_at) : 'No expiry'}
                </td>
                <td className="px-5 py-4">
                  <Badge variant={promo.is_active ? 'success' : 'danger'}>
                    {promo.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(promo)}
                      className="text-xs text-[#6B3A22] hover:text-[#3B1F0E] underline">
                      Edit
                    </button>
                    <button onClick={() => toggleActive(promo.id, promo.is_active)}
                      className={`text-xs underline ${promo.is_active ? 'text-red-400 hover:text-red-600' : 'text-green-600 hover:text-green-800'}`}>
                      {promo.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => handleDelete(promo.id)}
                      className="text-xs text-red-400 hover:text-red-600 underline">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {promos.length === 0 && (
          <div className="py-16 text-center text-sm text-[#6B3A22]">
            No promos yet. Create your first discount code.
          </div>
        )}
      </div>
    </div>
  )
}
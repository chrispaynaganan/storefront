'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { ImageUploader } from './ImageUploader'
import { createClient } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import type { Product, Variant } from '@/types'

interface VariantRow {
  id?: string
  size: string
  color: string
  price: string
  compare_at_price: string
  stock_qty: string
  sku: string
}

interface Props {
  productId?: string
  initialData?: Product & { variants: Variant[] }
  collections: { id: string; name: string }[]
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const PRESET_COLORS = [
  { label: 'Black', value: '#000000' },
  { label: 'White', value: '#FFFFFF' },
  { label: 'Gray', value: '#9CA3AF' },
  { label: 'Brown', value: '#3B1F0E' },
  { label: 'Beige', value: '#F5F0E8' },
  { label: 'Navy', value: '#1E3A5F' },
  { label: 'Olive', value: '#6B7C3F' },
  { label: 'Red', value: '#DC2626' },
  { label: 'Pink', value: '#FFCBA4' },
]

function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {PRESET_COLORS.map(c => (
        <button
          key={c.value}
          type="button"
          title={c.label}
          onClick={() => onChange(c.value)}
          className={`w-6 h-6 rounded-full border-2 transition-all ${
            value === c.value ? 'border-brown scale-110' : 'border-transparent hover:border-brown/40'
          }`}
          style={{ backgroundColor: c.value }}
        />
      ))}
      <input
        type="color"
        value={value || '#000000'}
        onChange={e => onChange(e.target.value)}
        title="Custom color"
        className="w-6 h-6 rounded-full cursor-pointer border border-peach-light"
      />
    </div>
  )
}

export function ProductForm({ productId, initialData, collections }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(initialData?.name ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [collectionId, setCollectionId] = useState(initialData?.collection_id ?? '')
  const [images, setImages] = useState<string[]>(initialData?.image_urls ?? [])
  const [isBestseller, setIsBestseller] = useState(initialData?.is_bestseller ?? false)
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true)
  const [variants, setVariants] = useState<VariantRow[]>(
    initialData?.variants?.map(v => ({
      id: v.id,
      size: v.size,
      color: v.color ?? '',
      price: String(v.price),
      compare_at_price: v.compare_at_price ? String(v.compare_at_price) : '',
      stock_qty: String(v.stock_qty),
      sku: v.sku ?? '',
    })) ?? [{ size: 'M', color: '', price: '', compare_at_price: '', stock_qty: '', sku: '' }]
  )

  function addVariant() {
    setVariants(prev => [...prev, { size: 'M', color: '', price: '', compare_at_price: '', stock_qty: '', sku: '' }])
  }

  function removeVariant(i: number) {
    setVariants(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateVariant(i: number, field: keyof VariantRow, value: string) {
    setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()

    try {
      const productData = {
        name, slug, description, collection_id: collectionId || null,
        image_urls: images, is_bestseller: isBestseller, is_active: isActive,
      }

      let pid = productId
      if (productId) {
        await supabase.from('products').update(productData).eq('id', productId)
      } else {
        const { data } = await supabase.from('products').insert(productData).select().single()
        pid = data?.id
      }

      if (pid) {
        if (productId) await supabase.from('variants').delete().eq('product_id', pid)
        await supabase.from('variants').insert(
          variants.filter(v => v.price).map(v => ({
            product_id: pid,
            size: v.size,
            color: v.color || null,
            price: parseFloat(v.price),
            compare_at_price: v.compare_at_price ? parseFloat(v.compare_at_price) : null,
            stock_qty: parseInt(v.stock_qty) || 0,
            sku: v.sku || null,
          }))
        )
      }

      router.push('/admin/products')
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* Basic info */}
      <div className="bg-white rounded-xl border border-peach-light p-4 md:p-6 space-y-4">
        <h2 className="text-sm font-medium text-brown">Basic info</h2>
        <Input label="Product name" value={name}
          onChange={e => { setName(e.target.value); if (!productId) setSlug(slugify(e.target.value)) }} />
        <Input label="Slug (URL)" value={slug} onChange={e => setSlug(e.target.value)} />
        <div>
          <label className="block text-sm text-brown mb-1.5">Collection</label>
          <select
            value={collectionId}
            onChange={e => setCollectionId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-peach-light bg-white text-sm text-brown focus:outline-none focus:ring-2 focus:ring-peach"
          >
            <option value="">No collection</option>
            {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <Textarea label="Description" value={description} onChange={e => setDescription(e.target.value)} />
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl border border-peach-light p-4 md:p-6 space-y-4">
        <h2 className="text-sm font-medium text-brown">Images</h2>
        <ImageUploader value={images} onChange={setImages} />
      </div>

      {/* Variants */}
      <div className="bg-white rounded-xl border border-peach-light p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-brown">Variants & pricing</h2>
          <button type="button" onClick={addVariant}
            className="text-xs text-brown-light hover:text-brown underline">
            + Add variant
          </button>
        </div>

        {/* Desktop grid header */}
        <div className="hidden md:grid grid-cols-6 gap-2 text-xs text-brown-light font-medium">
          <span>Size</span>
          <span className="col-span-2">Color</span>
          <span>Price (₱)</span>
          <span>Compare (₱)</span>
          <span>Stock</span>
        </div>

        {/* Desktop grid rows */}
        <div className="hidden md:block space-y-4">
          {variants.map((v, i) => (
            <div key={i} className="space-y-2">
              <div className="grid grid-cols-6 gap-2 items-center">
                <select
                  value={v.size}
                  onChange={e => updateVariant(i, 'size', e.target.value)}
                  className="px-2 py-2 rounded-lg border border-peach-light text-sm text-brown bg-white focus:outline-none"
                >
                  {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="col-span-2 flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border border-peach-light shrink-0"
                    style={{ backgroundColor: v.color || '#f0f0f0' }}
                  />
                  <input
                    value={v.color}
                    onChange={e => updateVariant(i, 'color', e.target.value)}
                    placeholder="#000000 or empty"
                    className="flex-1 px-2 py-2 rounded-lg border border-peach-light text-sm text-brown focus:outline-none focus:ring-1 focus:ring-peach"
                  />
                </div>
                <input value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)}
                  placeholder="890" type="number"
                  className="px-2 py-2 rounded-lg border border-peach-light text-sm text-brown focus:outline-none focus:ring-1 focus:ring-peach" />
                <input value={v.compare_at_price} onChange={e => updateVariant(i, 'compare_at_price', e.target.value)}
                  placeholder="1200" type="number"
                  className="px-2 py-2 rounded-lg border border-peach-light text-sm text-brown focus:outline-none focus:ring-1 focus:ring-peach" />
                <div className="flex gap-1">
                  <input value={v.stock_qty} onChange={e => updateVariant(i, 'stock_qty', e.target.value)}
                    placeholder="10" type="number"
                    className="flex-1 px-2 py-2 rounded-lg border border-peach-light text-sm text-brown focus:outline-none focus:ring-1 focus:ring-peach" />
                  {variants.length > 1 && (
                    <button type="button" onClick={() => removeVariant(i)}
                      className="text-brown-light hover:text-red-500 px-1 text-lg leading-none">×</button>
                  )}
                </div>
              </div>
              {/* Color picker */}
              <div className="pl-0">
                <ColorPicker value={v.color} onChange={val => updateVariant(i, 'color', val)} />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile stacked cards */}
        <div className="md:hidden space-y-3">
          {variants.map((v, i) => (
            <div key={i} className="border border-peach-light rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-brown">Variant {i + 1}</label>
                {variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(i)}
                    className="text-xs text-brown-light hover:text-red-500">Remove</button>
                )}
              </div>
              <div>
                <label className="block text-xs text-brown-light mb-1">Size</label>
                <select
                  value={v.size}
                  onChange={e => updateVariant(i, 'size', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-peach-light text-sm text-brown bg-white focus:outline-none"
                >
                  {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-brown-light mb-1">Color</label>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-6 h-6 rounded-full border border-peach-light shrink-0"
                    style={{ backgroundColor: v.color || '#f0f0f0' }}
                  />
                  <input
                    value={v.color}
                    onChange={e => updateVariant(i, 'color', e.target.value)}
                    placeholder="#000000 or empty"
                    className="flex-1 px-3 py-2 rounded-lg border border-peach-light text-sm text-brown focus:outline-none"
                  />
                </div>
                <ColorPicker value={v.color} onChange={val => updateVariant(i, 'color', val)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-brown-light mb-1">Price (₱)</label>
                  <input value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)}
                    placeholder="890" type="number"
                    className="w-full px-3 py-2 rounded-lg border border-peach-light text-sm text-brown focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-brown-light mb-1">Compare at (₱)</label>
                  <input value={v.compare_at_price} onChange={e => updateVariant(i, 'compare_at_price', e.target.value)}
                    placeholder="1200" type="number"
                    className="w-full px-3 py-2 rounded-lg border border-peach-light text-sm text-brown focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-brown-light mb-1">Stock</label>
                  <input value={v.stock_qty} onChange={e => updateVariant(i, 'stock_qty', e.target.value)}
                    placeholder="10" type="number"
                    className="w-full px-3 py-2 rounded-lg border border-peach-light text-sm text-brown focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-brown-light mb-1">SKU</label>
                  <input value={v.sku} onChange={e => updateVariant(i, 'sku', e.target.value)}
                    placeholder="SKU-001"
                    className="w-full px-3 py-2 rounded-lg border border-peach-light text-sm text-brown focus:outline-none" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl border border-peach-light p-4 md:p-6 space-y-4">
        <h2 className="text-sm font-medium text-brown">Settings</h2>
        <Toggle checked={isBestseller} onChange={setIsBestseller} label="Mark as bestseller" />
        <Toggle checked={isActive} onChange={setIsActive} label="Active (visible on store)" />
      </div>

      <div className="flex gap-3 pb-4">
        <Button type="submit" disabled={saving}
          className="bg-brown text-whitewash hover:bg-brown-light px-8 py-3 rounded-lg">
          {saving ? 'Saving...' : productId ? 'Save changes' : 'Add product'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}
          className="border-brown text-brown px-8 py-3 rounded-lg">
          Cancel
        </Button>
      </div>
    </form>
  )
}
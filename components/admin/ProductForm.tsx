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
      price: String(v.price),
      compare_at_price: v.compare_at_price ? String(v.compare_at_price) : '',
      stock_qty: String(v.stock_qty),
      sku: v.sku ?? '',
    })) ?? [{ size: 'M', price: '', compare_at_price: '', stock_qty: '', sku: '' }]
  )

  function addVariant() {
    setVariants(prev => [...prev, { size: 'M', price: '', compare_at_price: '', stock_qty: '', sku: '' }])
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
        // delete old variants then re-insert
        if (productId) await supabase.from('variants').delete().eq('product_id', pid)
        await supabase.from('variants').insert(
          variants.filter(v => v.price).map(v => ({
            product_id: pid,
            size: v.size,
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
      <div className="bg-white rounded-xl border border-[#FFE8D6] p-6 space-y-4">
        <h2 className="text-sm font-medium text-[#3B1F0E]">Basic info</h2>
        <Input label="Product name" value={name}
          onChange={e => { setName(e.target.value); if (!productId) setSlug(slugify(e.target.value)) }} />
        <Input label="Slug (URL)" value={slug} onChange={e => setSlug(e.target.value)} />
        <div>
          <label className="block text-sm text-[#3B1F0E] mb-1.5">Collection</label>
          <select
            value={collectionId}
            onChange={e => setCollectionId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-[#FFE8D6] bg-white text-sm text-[#3B1F0E] focus:outline-none focus:ring-2 focus:ring-[#FFCBA4]"
          >
            <option value="">No collection</option>
            {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <Textarea label="Description" value={description} onChange={e => setDescription(e.target.value)} />
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl border border-[#FFE8D6] p-6 space-y-4">
        <h2 className="text-sm font-medium text-[#3B1F0E]">Images</h2>
        <ImageUploader value={images} onChange={setImages} />
      </div>

      {/* Variants */}
      <div className="bg-white rounded-xl border border-[#FFE8D6] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-[#3B1F0E]">Variants & pricing</h2>
          <button type="button" onClick={addVariant}
            className="text-xs text-[#6B3A22] hover:text-[#3B1F0E] underline">
            + Add size
          </button>
        </div>
        <div className="grid grid-cols-5 gap-2 text-xs text-[#6B3A22] font-medium mb-1">
          <span>Size</span><span>Price (₱)</span><span>Compare at (₱)</span><span>Stock</span><span>SKU</span>
        </div>
        {variants.map((v, i) => (
          <div key={i} className="grid grid-cols-5 gap-2 items-center">
            <select
              value={v.size}
              onChange={e => updateVariant(i, 'size', e.target.value)}
              className="px-2 py-2 rounded-lg border border-[#FFE8D6] text-sm text-[#3B1F0E] bg-white focus:outline-none"
            >
              {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input value={v.price} onChange={e => updateVariant(i, 'price', e.target.value)}
              placeholder="890" type="number"
              className="px-2 py-2 rounded-lg border border-[#FFE8D6] text-sm text-[#3B1F0E] focus:outline-none focus:ring-1 focus:ring-[#FFCBA4]" />
            <input value={v.compare_at_price} onChange={e => updateVariant(i, 'compare_at_price', e.target.value)}
              placeholder="1200" type="number"
              className="px-2 py-2 rounded-lg border border-[#FFE8D6] text-sm text-[#3B1F0E] focus:outline-none focus:ring-1 focus:ring-[#FFCBA4]" />
            <input value={v.stock_qty} onChange={e => updateVariant(i, 'stock_qty', e.target.value)}
              placeholder="10" type="number"
              className="px-2 py-2 rounded-lg border border-[#FFE8D6] text-sm text-[#3B1F0E] focus:outline-none focus:ring-1 focus:ring-[#FFCBA4]" />
            <div className="flex gap-1">
              <input value={v.sku} onChange={e => updateVariant(i, 'sku', e.target.value)}
                placeholder="SKU-001"
                className="flex-1 min-w-0 px-2 py-2 rounded-lg border border-[#FFE8D6] text-sm text-[#3B1F0E] focus:outline-none focus:ring-1 focus:ring-[#FFCBA4]" />
              {variants.length > 1 && (
                <button type="button" onClick={() => removeVariant(i)}
                  className="text-[#6B3A22] hover:text-red-500 px-1 text-lg leading-none">×</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl border border-[#FFE8D6] p-6 space-y-4">
        <h2 className="text-sm font-medium text-[#3B1F0E]">Settings</h2>
        <Toggle checked={isBestseller} onChange={setIsBestseller} label="Mark as bestseller" />
        <Toggle checked={isActive} onChange={setIsActive} label="Active (visible on store)" />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}
          className="bg-[#3B1F0E] text-white hover:bg-[#6B3A22] px-8 py-3 rounded-lg">
          {saving ? 'Saving...' : productId ? 'Save changes' : 'Add product'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}
          className="border-[#3B1F0E] text-[#3B1F0E] px-8 py-3 rounded-lg">
          Cancel
        </Button>
      </div>
    </form>
  )
}
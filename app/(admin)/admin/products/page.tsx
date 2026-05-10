'use client'

// app/(admin)/admin/products/page.tsx

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { slugify, formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Collection { id: string; name: string }

interface Variant {
  id?: string
  size: string
  color: string
  price: number
  compare_at_price: number | null
  stock_qty: number
  sku: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  image_urls: string[]
  is_active: boolean
  is_bestseller: boolean
  collections: { name: string } | null
  variants: Variant[]
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size']

// ─── SKU generator ─────────────────────────────────────────────────────────
// Format: KW-{SLUG_ABBREV}-{SIZE}-{4_CHAR_HEX}
// e.g. KW-CLS-SHIRT-M-3F9A
function generateSku(productSlug: string, size: string): string {
  const abbrev = productSlug
    .toUpperCase()
    .replace(/-/g, '-')
    .split('-')
    .map(w => w.slice(0, 3))
    .join('-')
    .slice(0, 12) // cap at 12 chars
  const rand = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .toUpperCase()
    .padStart(4, '0')
  return `KW-${abbrev}-${size.toUpperCase().replace(/\s/g, '')}-${rand}`
}

// ─── Shared field components ──────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-brown/70 font-medium">{label}</label>
      {children}
    </div>
  )
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full bg-gray-100 rounded-2xl px-4 py-3 text-sm text-brown placeholder:text-brown/30 outline-none focus:ring-2 focus:ring-peach transition"
    />
  )
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        {...props}
        className="w-full appearance-none bg-gray-100 rounded-2xl px-4 py-3 text-sm text-brown outline-none focus:ring-2 focus:ring-peach transition pr-10"
      />
      <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

function TextareaInput(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={3}
      className="w-full bg-gray-100 rounded-2xl px-4 py-3 text-sm text-brown placeholder:text-brown/30 outline-none focus:ring-2 focus:ring-peach transition resize-none"
    />
  )
}

// ─── Add Size sub-modal ───────────────────────────────────────────────────────

function AddSizeModal({
  productSlug,
  onAdd,
  onClose,
}: {
  productSlug: string
  onAdd: (v: Variant) => void
  onClose: () => void
}) {
  const [size, setSize] = useState('S')
  const [color, setColor] = useState('')
  const [price, setPrice] = useState('')
  const [compareAt, setCompareAt] = useState('')
  const [stock, setStock] = useState('')

  // Live SKU preview — regenerates on size change
  const previewSku = generateSku(productSlug || 'product', size)

  function handleAdd() {
    if (!price || !stock) return
    onAdd({
      size,
      color,
      price: parseFloat(price),
      compare_at_price: compareAt ? parseFloat(compareAt) : null,
      stock_qty: parseInt(stock),
      sku: generateSku(productSlug || 'product', size),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-brown">Add Size</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
            <svg className="w-5 h-5 text-brown/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <Field label="Size">
          <SelectInput value={size} onChange={e => setSize(e.target.value)}>
            {SIZES.map(s => <option key={s}>{s}</option>)}
          </SelectInput>
        </Field>

        <Field label="Color">
          <TextInput placeholder="e.g. Black" value={color} onChange={e => setColor(e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (PHP)">
            <TextInput type="number" placeholder="0" value={price} onChange={e => setPrice(e.target.value)} />
          </Field>
          <Field label="Compare at (PHP)">
            <TextInput type="number" placeholder="0" value={compareAt} onChange={e => setCompareAt(e.target.value)} />
          </Field>
        </div>

        <Field label="Stock">
          <TextInput type="number" placeholder="0" value={stock} onChange={e => setStock(e.target.value)} />
        </Field>

        {/* SKU preview — read only */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-brown/70 font-medium">SKU <span className="text-brown/30 font-normal">(auto-generated)</span></label>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-brown/50 font-mono tracking-wide select-all">
            {previewSku}
          </div>
        </div>

        <button
          onClick={handleAdd}
          className="w-full bg-brown-light text-white font-semibold rounded-2xl py-3.5 flex items-center justify-center gap-2 hover:bg-brown transition mt-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Size
        </button>
      </div>
    </div>
  )
}

// ─── Product modal (Add / Edit) ───────────────────────────────────────────────

function ProductModal({
  mode,
  product,
  collections,
  onClose,
  onSaved,
}: {
  mode: 'add' | 'edit'
  product?: Product
  collections: Collection[]
  onClose: () => void
  onSaved: () => void
}) {
  const supabase = createClient()
  const [name, setName] = useState(product?.name ?? '')
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [collectionId, setCollectionId] = useState('')
  const [description, setDescription] = useState(product?.description ?? '')
  const [isActive, setIsActive] = useState(product?.is_active ?? true)
  const [isBestseller, setIsBestseller] = useState(product?.is_bestseller ?? false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [variants, setVariants] = useState<Variant[]>(product?.variants ?? [])
  const [showAddSize, setShowAddSize] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Pre-fill collection id
  useEffect(() => {
    if (product && collections.length) {
      const match = collections.find(c => c.name === product.collections?.name)
      if (match) setCollectionId(match.id)
    } else if (collections.length) {
      setCollectionId(collections[0].id)
    }
  }, [product, collections])

  // Auto-slug from name on add
  useEffect(() => {
    if (mode === 'add') setSlug(slugify(name))
  }, [name, mode])

  async function handleSave() {
    if (!name || !slug) { setError('Name and slug are required.'); return }
    setSaving(true); setError('')
    try {
      // Upload images
      let imageUrls: string[] = product?.image_urls ?? []
      for (const file of imageFiles) {
        const ext = file.name.split('.').pop()
        const path = `${slug}-${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('products').upload(path, file)
        if (upErr) throw upErr
        const { data: urlData } = supabase.storage.from('products').getPublicUrl(path)
        imageUrls = [...imageUrls, urlData.publicUrl]
      }

      if (mode === 'add') {
        const { data: prod, error: prodErr } = await supabase
          .from('products')
          .insert({ name, slug, description, collection_id: collectionId, image_urls: imageUrls, is_active: isActive, is_bestseller: isBestseller })
          .select('id').single()
        if (prodErr) throw prodErr
        if (variants.length) {
          const rows = variants.map(v => ({ ...v, product_id: prod.id }))
          const { error: vErr } = await supabase.from('variants').insert(rows)
          if (vErr) throw vErr
        }
      } else if (product) {
        const { error: prodErr } = await supabase
          .from('products')
          .update({ name, slug, description, collection_id: collectionId, image_urls: imageUrls, is_active: isActive, is_bestseller: isBestseller })
          .eq('id', product.id)
        if (prodErr) throw prodErr
        // Upsert variants (new ones don't have id)
        const newVariants = variants.filter(v => !v.id).map(v => ({ ...v, product_id: product.id }))
        if (newVariants.length) {
          const { error: vErr } = await supabase.from('variants').insert(newVariants)
          if (vErr) throw vErr
        }
      }
      onSaved()
      onClose()
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  const formContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
      {/* ── Left: Basic Info ── */}
      <div className="flex flex-col gap-5">
        <h3 className="text-xl font-bold text-brown">Basic Info</h3>

        <Field label="Product Name">
          <TextInput placeholder="Classic Shirt" value={name} onChange={e => setName(e.target.value)} />
        </Field>

        <Field label="Slug (URL)">
          <TextInput placeholder="classic-shirt" value={slug} onChange={e => setSlug(e.target.value)} />
        </Field>

        <Field label="Collection">
          <SelectInput value={collectionId} onChange={e => setCollectionId(e.target.value)}>
            {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </SelectInput>
        </Field>

        <Field label="Description">
          <TextareaInput placeholder="Nice shirt" value={description} onChange={e => setDescription(e.target.value)} />
        </Field>

        {/* Toggles */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="accent-brown w-4 h-4" />
            <span className="text-sm text-brown/70">Active</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isBestseller} onChange={e => setIsBestseller(e.target.checked)} className="accent-brown w-4 h-4" />
            <span className="text-sm text-brown/70">Bestseller</span>
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="text-xl font-bold text-brown">Images</h4>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-peach transition"
          >
            {/* Mobile: tap prompt */}
            <p className="sm:hidden text-sm text-brown/60">Tap to add images</p>
            {/* sm+: drag & browse */}
            <p className="hidden sm:block text-sm text-brown/60">
              Drag images here or{' '}
              <span className="underline font-medium">browse</span>
            </p>
            <p className="text-xs text-brown/30 mt-1">WEBP files up to 5MB</p>
          </div>
          <input ref={fileRef} type="file" accept="image/webp" multiple className="hidden" onChange={e => setImageFiles(Array.from(e.target.files ?? []))} />
          {imageFiles.length > 0 && (
            <p className="text-xs text-brown/50">{imageFiles.length} file(s) selected</p>
          )}
          {(product?.image_urls ?? []).length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {product!.image_urls.map((url, i) => (
                <img key={i} src={url} alt="" className="w-14 h-14 rounded-xl object-cover border border-whitewash-off" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Variants & Pricing ── */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-brown">Variants &amp; Pricing</h3>
          <button
            onClick={() => setShowAddSize(true)}
            className="text-sm underline text-brown/60 hover:text-brown transition"
          >
            Add size
          </button>
        </div>

        {variants.length === 0 ? (
          <button
            onClick={() => setShowAddSize(true)}
            className="flex items-center gap-2 text-sm text-brown/50 hover:text-brown transition border border-dashed border-gray-200 rounded-2xl px-4 py-3"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add size variant
          </button>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-brown/40 text-xs">
                  <th className="px-3 py-2 text-left font-medium">Size</th>
                  <th className="px-3 py-2 text-left font-medium">Price (PHP)</th>
                  <th className="px-3 py-2 text-left font-medium">Compare at</th>
                  <th className="px-3 py-2 text-left font-medium">Stock</th>
                  <th className="px-3 py-2 text-left font-medium">SKU</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-3 py-2.5 text-brown">{v.size}</td>
                    <td className="px-3 py-2.5 text-brown">{v.price}</td>
                    <td className="px-3 py-2.5 text-brown">{v.compare_at_price ?? '—'}</td>
                    <td className="px-3 py-2.5 text-brown">{v.stock_qty}</td>
                    <td className="px-3 py-2.5 text-brown font-mono text-xs">{v.sku}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Submit */}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-brown-light text-white font-semibold rounded-2xl py-3.5 flex items-center justify-center gap-2 hover:bg-brown transition disabled:opacity-50 mt-auto"
        >
          {saving ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          )}
          {mode === 'add' ? 'Add Product' : 'Update Product'}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        {/* Modal — slide-up sheet on mobile, centered dialog on sm+ */}
        <div className="relative bg-white w-full sm:max-w-3xl sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[90dvh] sm:max-h-[88vh]">
          {/* Sticky header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
            <h2 className="text-2xl font-bold text-brown">
              {mode === 'add' ? 'Add Product' : 'Edit Product'}
            </h2>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
              <svg className="w-5 h-5 text-brown/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 px-6 py-5">
            {formContent}
          </div>
        </div>
      </div>

      {/* Add size sub-modal */}
      {showAddSize && (
        <AddSizeModal
          productSlug={slug}
          onAdd={v => setVariants(prev => [...prev, v])}
          onClose={() => setShowAddSize(false)}
        />
      )}
    </>
  )
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────

function DeleteConfirmModal({
  productName,
  onConfirm,
  onClose,
}: {
  productName: string
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-brown">Delete product?</h3>
        <p className="text-sm text-brown/60">
          <span className="font-semibold text-brown">{productName}</span> will be permanently deleted. This cannot be undone.
        </p>
        <div className="flex gap-3 mt-2">
          <button onClick={onClose} className="flex-1 bg-gray-100 text-brown font-semibold rounded-2xl py-3 hover:bg-gray-200 transition text-sm">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 bg-red-500 text-white font-semibold rounded-2xl py-3 hover:bg-red-600 transition text-sm">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className={cn(
      'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
      active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500',
    )}>
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const PER_PAGE = 10

  const [modal, setModal] = useState<null | 'add' | 'edit'>(null)
  const [editProduct, setEditProduct] = useState<Product | undefined>()
  const [deleteProduct, setDeleteProduct] = useState<Product | undefined>()

  async function load() {
    setLoading(true)
    const from = (page - 1) * PER_PAGE
    const to = from + PER_PAGE - 1

    const [{ data: prods, count }, { data: cols }] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, slug, description, image_urls, is_active, is_bestseller, collections(name), variants(id, size, color, price, compare_at_price, stock_qty, sku)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to),
      supabase.from('collections').select('id, name').order('name'),
    ])

    setProducts((prods as unknown as Product[]) ?? [])
    setCollections(cols ?? [])
    setTotal(count ?? 0)
    setLoading(false)
  }

  useEffect(() => { load() }, [page])

  async function handleDelete(product: Product) {
    await supabase.from('products').delete().eq('id', product.id)
    setDeleteProduct(undefined)
    load()
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="px-5 py-8 md:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-brown tracking-tight">Products</h1>
        {/* Mobile: icon button */}
        <button
          onClick={() => { setEditProduct(undefined); setModal('add') }}
          className="md:hidden w-12 h-12 rounded-2xl border-2 border-brown flex items-center justify-center hover:bg-brown hover:text-white transition"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        {/* md+: text button */}
        <button
          onClick={() => { setEditProduct(undefined); setModal('add') }}
          className="hidden md:flex items-center gap-2 border-2 border-brown text-brown font-semibold rounded-2xl px-5 py-2.5 text-sm hover:bg-brown hover:text-white transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Products
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-brown/40 text-sm">No products yet.</div>
      ) : (
        <>
          {/* ── Mobile: cards ── */}
          <div className="md:hidden flex flex-col gap-4">
            {products.map(p => {
              const minPrice = p.variants.length
                ? Math.min(...p.variants.map(v => v.price))
                : null
              return (
                <div key={p.id} className="bg-white rounded-2xl border border-whitewash-off p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    {/* Status badge top-left */}
                    <ActiveBadge active={p.is_active} />
                  </div>
                  <div className="flex items-center gap-3">
                    {p.image_urls?.[0] ? (
                      <img src={p.image_urls[0]} alt={p.name} className="w-14 h-14 rounded-xl object-cover bg-gray-100 shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gray-100 shrink-0 flex items-center justify-center text-brown/20">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-brown text-lg truncate">{p.name}</p>
                      <p className="text-xs text-brown/40 truncate">{p.slug}</p>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => { setEditProduct(p); setModal('edit') }}
                        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition text-brown/60 hover:text-brown"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteProduct(p)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-red-50 transition text-red-400 hover:text-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-50">
                    <div>
                      <p className="text-xs text-brown/40">Collection</p>
                      <p className="text-sm font-semibold text-brown">{p.collections?.name ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-brown/40">Variants</p>
                      <p className="text-sm font-semibold text-brown">{p.variants.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-brown/40">Price Starts</p>
                      <p className="text-sm font-semibold text-brown">
                        {minPrice !== null ? formatPrice(minPrice) : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── md+: table ── */}
          <div className="hidden md:block">
            <div className="rounded-2xl border border-whitewash-off overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-whitewash-off">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-brown/40 uppercase tracking-wide">Product</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-brown/40 uppercase tracking-wide">Collection</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-brown/40 uppercase tracking-wide">Variants</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-brown/40 uppercase tracking-wide">Price From</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-brown/40 uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-brown/40 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {products.map((p, i) => {
                    const minPrice = p.variants.length
                      ? Math.min(...p.variants.map(v => v.price))
                      : null
                    return (
                      <tr key={p.id} className={cn('border-b border-whitewash-off last:border-0', i % 2 === 0 ? 'bg-white' : 'bg-whitewash/40')}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {p.image_urls?.[0] ? (
                              <img src={p.image_urls[0]} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-gray-100 shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
                            )}
                            <div>
                              <p className="font-semibold text-brown">{p.name}</p>
                              <p className="text-xs text-brown/40">{p.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-brown">{p.collections?.name ?? '—'}</td>
                        <td className="px-5 py-4 text-brown">{p.variants.length}</td>
                        <td className="px-5 py-4 text-brown">{minPrice !== null ? formatPrice(minPrice) : '—'}</td>
                        <td className="px-5 py-4"><ActiveBadge active={p.is_active} /></td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setEditProduct(p); setModal('edit') }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-brown/50 hover:text-brown"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteProduct(p)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition text-red-400 hover:text-red-600"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 text-sm text-brown/50">
                <span>Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-white border border-whitewash-off disabled:opacity-30 transition"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-white border border-whitewash-off disabled:opacity-30 transition"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      {modal && (
        <ProductModal
          mode={modal}
          product={editProduct}
          collections={collections}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}
      {deleteProduct && (
        <DeleteConfirmModal
          productName={deleteProduct.name}
          onConfirm={() => handleDelete(deleteProduct)}
          onClose={() => setDeleteProduct(undefined)}
        />
      )}
    </div>
  )
}
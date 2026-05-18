'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { logAction, buildDiff } from '@/lib/log-client'
import { slugify, formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

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
  audience: string | null
  product_type: string | null
  collections: { name: string } | null
  variants: Variant[]
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size']

const DEFAULT_AUDIENCES = ['Women', 'Men', 'Kids', 'Sports']
const DEFAULT_PRODUCT_TYPES = ['Shirts', 'Hoodies']

const PRESET_COLORS = [
  { label: 'Black',  value: '#000000' },
  { label: 'White',  value: '#FFFFFF' },
  { label: 'Gray',   value: '#9CA3AF' },
  { label: 'Brown',  value: '#3B1F0E' },
  { label: 'Beige',  value: '#F5F0E8' },
  { label: 'Navy',   value: '#1E3A5F' },
  { label: 'Olive',  value: '#6B7C3F' },
  { label: 'Red',    value: '#DC2626' },
  { label: 'Pink',   value: '#FFCBA4' },
]

// Light colors that need a dark checkmark
const LIGHT_COLORS = new Set(['#FFFFFF', '#F5F0E8', '#FFCBA4', '#9CA3AF'])

function generateSku(productSlug: string, size: string): string {
  const abbrev = productSlug
    .toUpperCase()
    .replace(/-/g, '-')
    .split('-')
    .map(w => w.slice(0, 3))
    .join('-')
    .slice(0, 12)
  const rand = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .toUpperCase()
    .padStart(4, '0')
  return `KW-${abbrev}-${size.toUpperCase().replace(/\s/g, '')}-${rand}`
}

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

function ExpandableSelect({
  value, onChange, options, onAddOption, placeholder = 'Select...',
}: {
  value: string; onChange: (v: string) => void; options: string[]
  onAddOption: (v: string) => void; placeholder?: string
}) {
  const [adding, setAdding] = useState(false)
  const [newValue, setNewValue] = useState('')

  function handleAdd() {
    const trimmed = newValue.trim()
    if (!trimmed) return
    onAddOption(trimmed)
    onChange(trimmed.toLowerCase())
    setNewValue('')
    setAdding(false)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none bg-gray-100 rounded-2xl px-4 py-3 text-sm text-brown outline-none focus:ring-2 focus:ring-peach transition pr-10"
        >
          <option value="">{placeholder}</option>
          {options.map(o => <option key={o} value={o.toLowerCase()}>{o}</option>)}
        </select>
        <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {adding ? (
        <div className="flex gap-2">
          <input
            autoFocus
            value={newValue}
            onChange={e => setNewValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false) }}
            placeholder="Type new option..."
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm text-brown placeholder:text-brown/30 outline-none focus:ring-2 focus:ring-peach transition"
          />
          <button type="button" onClick={handleAdd} className="px-4 py-2.5 bg-brown text-white text-sm rounded-2xl hover:bg-brown-light transition">Add</button>
          <button type="button" onClick={() => setAdding(false)} className="px-3 py-2.5 bg-gray-100 text-brown text-sm rounded-2xl hover:bg-gray-200 transition">✕</button>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="text-xs text-brown/40 hover:text-brown underline text-left transition">
          + Add new option
        </button>
      )}
    </div>
  )
}

function RichTextEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[100px] px-4 py-3 text-sm text-brown outline-none',
      },
    },
  })

  if (!editor) return null

  const ToolbarBtn = ({ onClick, active, children }: { onClick: () => void; active?: boolean; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors ${active ? 'bg-brown text-whitewash' : 'text-brown/60 hover:text-brown hover:bg-gray-100'}`}
    >
      {children}
    </button>
  )

  return (
    <div className="bg-gray-100 rounded-2xl overflow-hidden border border-transparent focus-within:ring-2 focus-within:ring-peach transition">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 flex-wrap">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}><strong>B</strong></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}><em>I</em></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>• List</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>1. List</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>H2</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>H3</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()}>—</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()}>↩</ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()}>↪</ToolbarBtn>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

function EditVariantModal({
  variant, productSlug, onSave, onClose,
}: {
  variant: Variant; productSlug: string; onSave: (v: Variant) => void; onClose: () => void
}) {
  const [size, setSize] = useState(variant.size)
  const [color, setColor] = useState(variant.color ?? '')
  const [price, setPrice] = useState(String(variant.price))
  const [compareAt, setCompareAt] = useState(variant.compare_at_price ? String(variant.compare_at_price) : '')
  const [stock, setStock] = useState(String(variant.stock_qty))

  function handleSave() {
    onSave({
      ...variant,
      size,
      color,
      price: parseFloat(price),
      compare_at_price: compareAt ? parseFloat(compareAt) : null,
      stock_qty: parseInt(stock),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-5 max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-brown">Edit Variant</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
            <svg className="w-5 h-5 text-brown/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <Field label="Size">
          <SelectInput value={size} onChange={e => setSize(e.target.value)}>
            {SIZES.map(s => <option key={s}>{s}</option>)}
          </SelectInput>
        </Field>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-brown/70 font-medium">Color <span className="text-brown/30 font-normal">(optional)</span></label>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_COLORS.map(c => {
              const selected = color === c.value
              return (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onClick={() => setColor(selected ? '' : c.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all relative ${selected ? 'border-brown scale-110' : 'border-transparent hover:border-brown/40'}`}
                  style={{ backgroundColor: c.value }}
                >
                  {selected && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 drop-shadow" viewBox="0 0 24 24" fill="none" stroke={LIGHT_COLORS.has(c.value) ? '#3B1F0E' : 'white'} strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </button>
              )
            })}
            <input
              type="color"
              value={color || '#000000'}
              onChange={e => setColor(e.target.value)}
              title="Custom color"
              className="w-8 h-8 rounded-full cursor-pointer border border-peach-light"
            />
          </div>
          {color && (
            <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-3 py-2 w-fit">
              <div className="w-4 h-4 rounded-full border border-white/50 shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs text-brown/70 font-mono">{color}</span>
              <button type="button" onClick={() => setColor('')} className="text-brown/30 hover:text-brown/70 transition leading-none ml-1">×</button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (PHP)"><TextInput type="number" value={price} onChange={e => setPrice(e.target.value)} /></Field>
          <Field label="Compare at (PHP)"><TextInput type="number" value={compareAt} onChange={e => setCompareAt(e.target.value)} /></Field>
        </div>
        <Field label="Stock"><TextInput type="number" value={stock} onChange={e => setStock(e.target.value)} /></Field>
        <button onClick={handleSave} className="w-full bg-brown-light text-white font-semibold rounded-2xl py-3.5 hover:bg-brown transition">
          Save Changes
        </button>
      </div>
    </div>
  )
}

function AddSizeModal({
  productSlug, onAdd, onClose,
}: {
  productSlug: string; onAdd: (variants: Variant[]) => void; onClose: () => void
}) {
  const [size, setSize] = useState('S')
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [customColor, setCustomColor] = useState('')
  const [price, setPrice] = useState('')
  const [compareAt, setCompareAt] = useState('')
  const [stock, setStock] = useState('')

  const previewSku = generateSku(productSlug || 'product', size)

  function toggleColor(hex: string) {
    setSelectedColors(prev =>
      prev.includes(hex) ? prev.filter(c => c !== hex) : [...prev, hex]
    )
  }

  function addCustomColor() {
    const trimmed = customColor.trim()
    if (!trimmed || selectedColors.includes(trimmed)) return
    setSelectedColors(prev => [...prev, trimmed])
    setCustomColor('')
  }

  function removeColor(hex: string) {
    setSelectedColors(prev => prev.filter(c => c !== hex))
  }

  function handleAdd() {
    if (!price || !stock) return
    const colorsToAdd = selectedColors.length > 0 ? selectedColors : ['']
    const newVariants: Variant[] = colorsToAdd.map(color => ({
      size,
      color,
      price: parseFloat(price),
      compare_at_price: compareAt ? parseFloat(compareAt) : null,
      stock_qty: parseInt(stock),
      sku: generateSku(productSlug || 'product', size),
    }))
    onAdd(newVariants)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-5 max-h-[90dvh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-brown">Add Size</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
            <svg className="w-5 h-5 text-brown/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Size */}
        <Field label="Size">
          <SelectInput value={size} onChange={e => setSize(e.target.value)}>
            {SIZES.map(s => <option key={s}>{s}</option>)}
          </SelectInput>
        </Field>

        {/* Colors */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-brown/70 font-medium">
            Color <span className="text-brown/30 font-normal">(optional — select multiple)</span>
          </label>

          {/* Preset swatches */}
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_COLORS.map(c => {
              const selected = selectedColors.includes(c.value)
              return (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onClick={() => toggleColor(c.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all relative ${
                    selected ? 'border-brown scale-110' : 'border-transparent hover:border-brown/40'
                  }`}
                  style={{ backgroundColor: c.value }}
                >
                  {selected && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 drop-shadow" viewBox="0 0 24 24" fill="none" stroke={LIGHT_COLORS.has(c.value) ? '#3B1F0E' : 'white'} strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </button>
              )
            })}

            {/* Custom color picker */}
            <input
              type="color"
              value={customColor || '#000000'}
              onChange={e => setCustomColor(e.target.value)}
              onBlur={() => { if (customColor) addCustomColor() }}
              title="Custom color"
              className="w-8 h-8 rounded-full cursor-pointer border border-peach-light"
            />
          </div>

          {/* Selected color pills */}
          {selectedColors.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {selectedColors.map(hex => (
                <div key={hex} className="flex items-center gap-1.5 bg-gray-100 rounded-full pl-1.5 pr-2.5 py-1">
                  <div className="w-4 h-4 rounded-full border border-white/50 shrink-0" style={{ backgroundColor: hex }} />
                  <span className="text-xs text-brown/70 font-mono">{hex}</span>
                  <button
                    type="button"
                    onClick={() => removeColor(hex)}
                    className="ml-0.5 text-brown/30 hover:text-brown/70 transition leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {selectedColors.length === 0 && (
            <p className="text-xs text-brown/30">No color selected — variant will be colorless</p>
          )}
        </div>

        {/* Price & Compare */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (PHP)">
            <TextInput type="number" placeholder="0" value={price} onChange={e => setPrice(e.target.value)} />
          </Field>
          <Field label="Compare at (PHP)">
            <TextInput type="number" placeholder="0" value={compareAt} onChange={e => setCompareAt(e.target.value)} />
          </Field>
        </div>

        {/* Stock */}
        <Field label="Stock">
          <TextInput type="number" placeholder="0" value={stock} onChange={e => setStock(e.target.value)} />
        </Field>

        {/* SKU preview */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-brown/70 font-medium">
            SKU <span className="text-brown/30 font-normal">
              (auto-generated{selectedColors.length > 1 ? ` · ${selectedColors.length} variants` : ''})
            </span>
          </label>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-brown/50 font-mono tracking-wide select-all">
            {previewSku}{selectedColors.length > 1 ? ` + ${selectedColors.length - 1} more` : ''}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleAdd}
          disabled={!price || !stock}
          className="w-full bg-brown-light text-white font-semibold rounded-2xl py-3.5 flex items-center justify-center gap-2 hover:bg-brown transition mt-1 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {selectedColors.length > 1
            ? `Add ${selectedColors.length} Variants (Size ${size})`
            : 'Add Size'}
        </button>

      </div>
    </div>
  )
}

function ProductModal({
  mode, product, collections, onClose, onSaved,
}: {
  mode: 'add' | 'edit'; product?: Product; collections: Collection[]; onClose: () => void; onSaved: () => void
}) {
  const supabase = createClient()
  const [name, setName] = useState(product?.name ?? '')
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [collectionId, setCollectionId] = useState('')
  const [audience, setAudience] = useState(product?.audience ?? '')
  const [productType, setProductType] = useState(product?.product_type ?? '')
  const [audienceOptions, setAudienceOptions] = useState(DEFAULT_AUDIENCES)
  const [productTypeOptions, setProductTypeOptions] = useState(DEFAULT_PRODUCT_TYPES)
  const [description, setDescription] = useState(product?.description ?? '')
  const [isActive, setIsActive] = useState(product?.is_active ?? true)
  const [isBestseller, setIsBestseller] = useState(product?.is_bestseller ?? false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [variants, setVariants] = useState<Variant[]>(product?.variants ?? [])
  const [showAddSize, setShowAddSize] = useState(false)
  const [editVariant, setEditVariant] = useState<Variant | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (product && collections.length) {
      const match = collections.find(c => c.name === product.collections?.name)
      if (match) setCollectionId(match.id)
    } else if (collections.length) {
      setCollectionId(collections[0].id)
    }
  }, [product, collections])

  useEffect(() => {
    if (mode === 'add') setSlug(slugify(name))
  }, [name, mode])

  function handleSlugInput(value: string) {
    setSlug(value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
  }

  async function handleSaveVariant(updated: Variant) {
    if (updated.id) {
      const { error } = await supabase
        .from('variants')
        .update({
          size: updated.size,
          color: updated.color || null,
          price: updated.price,
          compare_at_price: updated.compare_at_price,
          stock_qty: updated.stock_qty,
        })
        .eq('id', updated.id)
      if (!error) setVariants(prev => prev.map(v => v.id === updated.id ? updated : v))
    } else {
      setVariants(prev => prev.map(v => v === editVariant ? updated : v))
    }
  }

  async function handleDeleteVariant(variant: Variant) {
    if (!confirm(`Delete size ${variant.size}?`)) return
    if (variant.id) await supabase.from('variants').delete().eq('id', variant.id)
    setVariants(prev => prev.filter(v => v !== variant))
  }

  async function handleSave() {
    if (!name || !slug) { setError('Name and slug are required.'); return }
    setSaving(true); setError('')
    try {
      let imageUrls: string[] = product?.image_urls ?? []
      for (const file of imageFiles) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('slug', slug)
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Upload failed.')
        imageUrls = [...imageUrls, json.url]
      }

      const payload = {
        name, slug, description,
        collection_id: collectionId,
        image_urls: imageUrls,
        is_active: isActive,
        is_bestseller: isBestseller,
        audience: audience || null,
        product_type: productType || null,
      }

      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from('users').select('full_name, role').eq('id', user?.id ?? '').single()

      if (mode === 'add') {
        const { data: prod, error: prodErr } = await supabase
          .from('products').insert(payload).select('id').single()
        if (prodErr) throw prodErr
        if (variants.length) {
          const { error: vErr } = await supabase.from('variants').insert(
            variants.map(v => ({ ...v, product_id: prod.id }))
          )
          if (vErr) throw vErr
        }
        await logAction({
          userId: user?.id, userName: profile?.full_name ?? user?.email, userRole: profile?.role,
          action: 'created', entity: 'product', entityId: prod.id, entityName: name,
          metadata: { audience: audience || null, product_type: productType || null, is_active: isActive },
        })
      } else if (product) {
        const { error: prodErr } = await supabase.from('products').update(payload).eq('id', product.id)
        if (prodErr) throw prodErr
        const newVariants = variants.filter(v => !v.id).map(v => ({ ...v, product_id: product.id }))
        if (newVariants.length) {
          const { error: vErr } = await supabase.from('variants').insert(newVariants)
          if (vErr) throw vErr
        }
        const before: Record<string, any> = {
          name: product.name, slug: product.slug, is_active: product.is_active,
          is_bestseller: product.is_bestseller, audience: product.audience, product_type: product.product_type,
        }
        const after: Record<string, any> = {
          name, slug, is_active: isActive,
          is_bestseller: isBestseller, audience: audience || null, product_type: productType || null,
        }
        await logAction({
          userId: user?.id, userName: profile?.full_name ?? user?.email, userRole: profile?.role,
          action: 'updated', entity: 'product', entityId: product.id, entityName: name,
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
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white w-full sm:max-w-3xl sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[90dvh] sm:max-h-[88vh]">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
            <h2 className="text-2xl font-bold text-brown">{mode === 'add' ? 'Add Product' : 'Edit Product'}</h2>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
              <svg className="w-5 h-5 text-brown/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">

              {/* Left col */}
              <div className="flex flex-col gap-5">
                <h3 className="text-xl font-bold text-brown">Basic Info</h3>

                <Field label="Product Name">
                  <TextInput placeholder="Classic Shirt" value={name} onChange={e => setName(e.target.value)} />
                </Field>

                <Field label="Slug (URL)">
                  <TextInput placeholder="classic-shirt" value={slug} onChange={e => handleSlugInput(e.target.value)} />
                </Field>

                <Field label="Collection">
                  <SelectInput value={collectionId} onChange={e => setCollectionId(e.target.value)}>
                    {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </SelectInput>
                </Field>

                <Field label="Audience">
                  <ExpandableSelect
                    value={audience}
                    onChange={setAudience}
                    options={audienceOptions}
                    onAddOption={v => setAudienceOptions(prev => [...prev, v])}
                    placeholder="Select audience..."
                  />
                </Field>

                <Field label="Product Type">
                  <ExpandableSelect
                    value={productType}
                    onChange={setProductType}
                    options={productTypeOptions}
                    onAddOption={v => setProductTypeOptions(prev => [...prev, v])}
                    placeholder="Select product type..."
                  />
                </Field>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-brown/70 font-medium">Description</label>
                  <RichTextEditor value={description} onChange={setDescription} />
                </div>

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
                  <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-peach transition">
                    <p className="sm:hidden text-sm text-brown/60">Tap to add images</p>
                    <p className="hidden sm:block text-sm text-brown/60">Drag images here or <span className="underline font-medium">browse</span></p>
                    <p className="text-xs text-brown/30 mt-1">JPG, PNG, WEBP up to 5MB — auto-converted to WEBP</p>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => setImageFiles(Array.from(e.target.files ?? []))} />
                  {imageFiles.length > 0 && <p className="text-xs text-brown/50">{imageFiles.length} file(s) selected</p>}
                  {(product?.image_urls ?? []).length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {product!.image_urls.map((url, i) => (
                        <img key={i} src={url} alt="" className="w-14 h-14 rounded-xl object-cover border border-whitewash-off" />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right col */}
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-brown">Variants &amp; Pricing</h3>
                  <button onClick={() => setShowAddSize(true)} className="text-sm underline text-brown/60 hover:text-brown transition">Add size</button>
                </div>

                {variants.length === 0 ? (
                  <button onClick={() => setShowAddSize(true)} className="flex items-center gap-2 text-sm text-brown/50 hover:text-brown transition border border-dashed border-gray-200 rounded-2xl px-4 py-3">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Add size variant
                  </button>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-gray-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-brown/40 text-xs">
                          <th className="px-3 py-2 text-left font-medium">Size</th>
                          <th className="px-3 py-2 text-left font-medium">Color</th>
                          <th className="px-3 py-2 text-left font-medium">Price</th>
                          <th className="px-3 py-2 text-left font-medium">Stock</th>
                          <th className="px-3 py-2 text-left font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map((v, i) => (
                          <tr key={i} className="border-t border-gray-100">
                            <td className="px-3 py-2.5 text-brown font-medium">{v.size}</td>
                            <td className="px-3 py-2.5">
                              {v.color
                                ? <div className="w-5 h-5 rounded-full border border-peach-light" style={{ backgroundColor: v.color }} />
                                : <span className="text-brown/30">—</span>}
                            </td>
                            <td className="px-3 py-2.5 text-brown">₱{v.price}</td>
                            <td className="px-3 py-2.5 text-brown">{v.stock_qty}</td>
                            <td className="px-3 py-2.5">
                              <div className="flex gap-2">
                                <button onClick={() => setEditVariant(v)} className="text-xs text-brown/50 hover:text-brown underline transition">Edit</button>
                                <button onClick={() => handleDeleteVariant(v)} className="text-xs text-red-400 hover:text-red-600 underline transition">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-brown-light text-white font-semibold rounded-2xl py-3.5 flex items-center justify-center gap-2 hover:bg-brown transition disabled:opacity-50 mt-auto"
                >
                  {saving ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  )}
                  {mode === 'add' ? 'Add Product' : 'Update Product'}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {showAddSize && (
        <AddSizeModal
          productSlug={slug}
          onAdd={newVariants => setVariants(prev => [...prev, ...newVariants])}
          onClose={() => setShowAddSize(false)}
        />
      )}
      {editVariant && (
        <EditVariantModal
          variant={editVariant}
          productSlug={slug}
          onSave={handleSaveVariant}
          onClose={() => setEditVariant(null)}
        />
      )}
    </>
  )
}

function DeleteConfirmModal({ productName, onConfirm, onClose }: { productName: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-brown">Delete product?</h3>
        <p className="text-sm text-brown/60">
          <span className="font-semibold text-brown">{productName}</span> will be permanently deleted. This cannot be undone.
        </p>
        <div className="flex gap-3 mt-2">
          <button onClick={onClose} className="flex-1 bg-gray-100 text-brown font-semibold rounded-2xl py-3 hover:bg-gray-200 transition text-sm">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-red-500 text-white font-semibold rounded-2xl py-3 hover:bg-red-600 transition text-sm">Delete</button>
        </div>
      </div>
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
        .select('id, name, slug, description, image_urls, is_active, is_bestseller, audience, product_type, collections(name), variants(id, size, color, price, compare_at_price, stock_qty, sku)', { count: 'exact' })
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
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('users').select('full_name, role').eq('id', user?.id ?? '').single()
    await supabase.from('products').delete().eq('id', product.id)
    await logAction({
      userId: user?.id, userName: profile?.full_name ?? user?.email, userRole: profile?.role,
      action: 'deleted', entity: 'product', entityId: product.id, entityName: product.name,
    })
    setDeleteProduct(undefined)
    load()
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="px-5 py-8 md:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-brown tracking-tight">Products</h1>
        <button
          onClick={() => { setEditProduct(undefined); setModal('add') }}
          className="md:hidden w-12 h-12 rounded-2xl border-2 border-brown flex items-center justify-center hover:bg-brown hover:text-white transition"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        </button>
        <button
          onClick={() => { setEditProduct(undefined); setModal('add') }}
          className="hidden md:flex items-center gap-2 border-2 border-brown text-brown font-semibold rounded-2xl px-5 py-2.5 text-sm hover:bg-brown hover:text-white transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Products
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />)}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-brown/40 text-sm">No products yet.</div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-4">
            {products.map(p => {
              const minPrice = p.variants.length ? Math.min(...p.variants.map(v => v.price)) : null
              const colors = [...new Set(p.variants.map(v => v.color).filter(Boolean))]
              return (
                <div key={p.id} className="bg-white rounded-2xl border border-whitewash-off p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <ActiveBadge active={p.is_active} />
                    {p.audience && <span className="text-xs bg-peach-light text-brown px-2 py-0.5 rounded-full capitalize">{p.audience}</span>}
                    {p.product_type && <span className="text-xs bg-whitewash-off text-brown px-2 py-0.5 rounded-full capitalize">{p.product_type}</span>}
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
                      {colors.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {colors.map(c => <div key={c} className="w-4 h-4 rounded-full border border-peach-light" style={{ backgroundColor: c }} />)}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => { setEditProduct(p); setModal('edit') }} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition text-brown/60 hover:text-brown">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button onClick={() => setDeleteProduct(p)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-red-50 transition text-red-400 hover:text-red-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-50">
                    <div><p className="text-xs text-brown/40">Collection</p><p className="text-sm font-semibold text-brown">{p.collections?.name ?? '—'}</p></div>
                    <div><p className="text-xs text-brown/40">Variants</p><p className="text-sm font-semibold text-brown">{p.variants.length}</p></div>
                    <div><p className="text-xs text-brown/40">Price From</p><p className="text-sm font-semibold text-brown">{minPrice !== null ? formatPrice(minPrice) : '—'}</p></div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <div className="rounded-2xl border border-whitewash-off overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-whitewash-off">
                    {['Product', 'Audience', 'Type', 'Collection', 'Variants', 'Price From', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-brown/40 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {products.map((p, i) => {
                    const minPrice = p.variants.length ? Math.min(...p.variants.map(v => v.price)) : null
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
                        <td className="px-5 py-4">
                          {p.audience
                            ? <span className="text-xs bg-peach-light text-brown px-2 py-1 rounded-full capitalize">{p.audience}</span>
                            : <span className="text-brown/30">—</span>}
                        </td>
                        <td className="px-5 py-4">
                          {p.product_type
                            ? <span className="text-xs bg-whitewash-off text-brown px-2 py-1 rounded-full capitalize">{p.product_type}</span>
                            : <span className="text-brown/30">—</span>}
                        </td>
                        <td className="px-5 py-4 text-brown">{p.collections?.name ?? '—'}</td>
                        <td className="px-5 py-4 text-brown">{p.variants.length}</td>
                        <td className="px-5 py-4 text-brown">{minPrice !== null ? formatPrice(minPrice) : '—'}</td>
                        <td className="px-5 py-4"><ActiveBadge active={p.is_active} /></td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => { setEditProduct(p); setModal('edit') }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-brown/50 hover:text-brown">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button onClick={() => setDeleteProduct(p)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition text-red-400 hover:text-red-600">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 text-sm text-brown/50">
                <span>Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-white border border-whitewash-off disabled:opacity-30 transition">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    Previous
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-white border border-whitewash-off disabled:opacity-30 transition">
                    Next
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {modal && (
        <ProductModal mode={modal} product={editProduct} collections={collections} onClose={() => setModal(null)} onSaved={load} />
      )}
      {deleteProduct && (
        <DeleteConfirmModal productName={deleteProduct.name} onConfirm={() => handleDelete(deleteProduct)} onClose={() => setDeleteProduct(undefined)} />
      )}
    </div>
  )
}
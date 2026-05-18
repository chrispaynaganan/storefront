'use client'

import { useRef, useState } from 'react'
import { Trash2, GripVertical, ChevronDown, ChevronUp, ImageIcon } from 'lucide-react'
import type { Block, ImageBlock, BannerBlock, TwoColumnBlock, SpacerBlock } from '@/types/cms'

// ─────────────────────────────────────────────
// Shared upload helper
// ─────────────────────────────────────────────

async function uploadImage(file: File): Promise<string | null> {
  const form = new FormData()
  form.append('file', file)
  form.append('folder', 'cms')
  const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
  const json = await res.json()
  return json.url ?? null
}

// ─────────────────────────────────────────────
// Shared UI primitives
// ─────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium text-brown/60 uppercase tracking-wider mb-1">
      {children}
    </p>
  )
}

function Input({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-peach-light rounded-lg px-3 py-2 text-sm text-brown bg-white focus:outline-none focus:ring-2 focus:ring-peach"
    />
  )
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      rows={rows}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-peach-light rounded-lg px-3 py-2 text-sm text-brown bg-white focus:outline-none focus:ring-2 focus:ring-peach resize-none"
    />
  )
}

function ImageUploadField({
  value,
  onChange,
  label = 'Image',
}: {
  value: string
  onChange: (url: string) => void
  label?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadImage(file)
    if (url) onChange(url)
    setUploading(false)
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2 items-center">
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="flex items-center gap-2 px-3 py-2 border border-peach-light rounded-lg text-sm text-brown-light hover:bg-peach-light/40 transition-colors"
        >
          <ImageIcon className="w-4 h-4" />
          {uploading ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}
        </button>
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-10 w-16 object-cover rounded border border-peach-light" />
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Individual block editors
// ─────────────────────────────────────────────

function ImageBlockEditor({
  block,
  onChange,
}: {
  block: ImageBlock
  onChange: (b: ImageBlock) => void
}) {
  return (
    <div className="space-y-3">
      <ImageUploadField
        value={block.image_url}
        onChange={url => onChange({ ...block, image_url: url })}
      />
      <div>
        <Label>Alt text</Label>
        <Input
          value={block.alt}
          onChange={v => onChange({ ...block, alt: v })}
          placeholder="Describe the image for accessibility"
        />
      </div>
      <div>
        <Label>Caption (optional)</Label>
        <Input
          value={block.caption ?? ''}
          onChange={v => onChange({ ...block, caption: v })}
          placeholder="Shown below the image"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-brown cursor-pointer">
        <input
          type="checkbox"
          checked={block.full_width}
          onChange={e => onChange({ ...block, full_width: e.target.checked })}
          className="accent-brown"
        />
        Full width
      </label>
    </div>
  )
}

function BannerBlockEditor({
  block,
  onChange,
}: {
  block: BannerBlock
  onChange: (b: BannerBlock) => void
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Heading</Label>
        <Input
          value={block.heading}
          onChange={v => onChange({ ...block, heading: v })}
          placeholder="Banner headline"
        />
      </div>
      <div>
        <Label>Subheading</Label>
        <Input
          value={block.subheading}
          onChange={v => onChange({ ...block, subheading: v })}
          placeholder="Supporting text"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Button text</Label>
          <Input
            value={block.cta_text}
            onChange={v => onChange({ ...block, cta_text: v })}
            placeholder="e.g. Shop now"
          />
        </div>
        <div>
          <Label>Button URL</Label>
          <Input
            value={block.cta_url}
            onChange={v => onChange({ ...block, cta_url: v })}
            placeholder="/shop"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Background color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={block.background_color}
              onChange={e => onChange({ ...block, background_color: e.target.value })}
              className="h-9 w-12 rounded border border-peach-light cursor-pointer"
            />
            <Input
              value={block.background_color}
              onChange={v => onChange({ ...block, background_color: v })}
            />
          </div>
        </div>
        <div>
          <Label>Text color</Label>
          <select
            value={block.text_color}
            onChange={e =>
              onChange({ ...block, text_color: e.target.value as 'light' | 'dark' })
            }
            className="w-full border border-peach-light rounded-lg px-3 py-2 text-sm text-brown bg-white focus:outline-none focus:ring-2 focus:ring-peach"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
      </div>
    </div>
  )
}

function TwoColumnBlockEditor({
  block,
  onChange,
}: {
  block: TwoColumnBlock
  onChange: (b: TwoColumnBlock) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {(['left', 'right'] as const).map(side => (
        <div key={side} className="space-y-3 p-3 bg-whitewash rounded-lg border border-peach-light">
          <p className="text-xs font-medium text-brown uppercase tracking-wider">
            {side === 'left' ? 'Left column' : 'Right column'}
          </p>
          <div>
            <Label>Heading</Label>
            <Input
              value={block[side].heading}
              onChange={v => onChange({ ...block, [side]: { ...block[side], heading: v } })}
              placeholder="Column heading"
            />
          </div>
          <div>
            <Label>Body text</Label>
            <Textarea
              value={block[side].body}
              onChange={v => onChange({ ...block, [side]: { ...block[side], body: v } })}
              placeholder="Column body text"
            />
          </div>
          <ImageUploadField
            value={block[side].image_url ?? ''}
            onChange={url =>
              onChange({ ...block, [side]: { ...block[side], image_url: url } })
            }
            label="Image (optional)"
          />
        </div>
      ))}
    </div>
  )
}

function SpacerBlockEditor({
  block,
  onChange,
}: {
  block: SpacerBlock
  onChange: (b: SpacerBlock) => void
}) {
  const sizes = [
    { value: 'sm', label: 'Small (24px)' },
    { value: 'md', label: 'Medium (48px)' },
    { value: 'lg', label: 'Large (80px)' },
    { value: 'xl', label: 'Extra large (120px)' },
  ]
  return (
    <div>
      <Label>Size</Label>
      <div className="flex gap-2 flex-wrap">
        {sizes.map(s => (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange({ ...block, size: s.value as SpacerBlock['size'] })}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              block.size === s.value
                ? 'bg-brown text-whitewash border-brown'
                : 'bg-white text-brown-light border-peach-light hover:border-brown'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Block wrapper card (drag handle, collapse, delete)
// ─────────────────────────────────────────────

const BLOCK_LABELS: Record<Block['type'], string> = {
  image: 'Image',
  banner: 'Banner',
  two_column: 'Two columns',
  spacer: 'Spacer / divider',
}

interface BlockCardProps {
  block: Block
  index: number
  total: number
  onChange: (b: Block) => void
  onDelete: () => void
  onMove: (dir: 'up' | 'down') => void
}

export function BlockCard({ block, index, total, onChange, onDelete, onMove }: BlockCardProps) {
  const [open, setOpen] = useState(true)

  return (
    <div className="border border-peach-light rounded-xl bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-whitewash border-b border-peach-light">
        <GripVertical className="w-4 h-4 text-brown/30 cursor-grab" />
        <span className="text-xs font-medium text-brown/50 w-5 text-center">{index + 1}</span>
        <span className="flex-1 text-sm font-medium text-brown">
          {BLOCK_LABELS[block.type]}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove('up')}
            disabled={index === 0}
            className="p-1 rounded hover:bg-peach-light/60 disabled:opacity-30 transition-colors"
          >
            <ChevronUp className="w-4 h-4 text-brown" />
          </button>
          <button
            type="button"
            onClick={() => onMove('down')}
            disabled={index === total - 1}
            className="p-1 rounded hover:bg-peach-light/60 disabled:opacity-30 transition-colors"
          >
            <ChevronDown className="w-4 h-4 text-brown" />
          </button>
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            className="p-1 rounded hover:bg-peach-light/60 transition-colors"
          >
            {open ? (
              <ChevronUp className="w-4 h-4 text-brown" />
            ) : (
              <ChevronDown className="w-4 h-4 text-brown" />
            )}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div className="p-4">
          {block.type === 'image' && (
            <ImageBlockEditor block={block} onChange={b => onChange(b)} />
          )}
          {block.type === 'banner' && (
            <BannerBlockEditor block={block} onChange={b => onChange(b)} />
          )}
          {block.type === 'two_column' && (
            <TwoColumnBlockEditor block={block} onChange={b => onChange(b)} />
          )}
          {block.type === 'spacer' && (
            <SpacerBlockEditor block={block} onChange={b => onChange(b)} />
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Add block button strip
// ─────────────────────────────────────────────

function newBlock(type: Block['type']): Block {
  const id = crypto.randomUUID()
  if (type === 'image') return { type, id, image_url: '', alt: '', full_width: false }
  if (type === 'banner')
    return {
      type,
      id,
      heading: '',
      subheading: '',
      cta_text: 'Shop now',
      cta_url: '/shop',
      background_color: '#FFCBA4',
      text_color: 'dark',
    }
  if (type === 'two_column')
    return {
      type,
      id,
      left: { heading: '', body: '' },
      right: { heading: '', body: '' },
    }
  return { type: 'spacer', id, size: 'md' }
}

export function AddBlockStrip({ onAdd }: { onAdd: (b: Block) => void }) {
  const types: { type: Block['type']; label: string }[] = [
    { type: 'image', label: '+ Image' },
    { type: 'banner', label: '+ Banner' },
    { type: 'two_column', label: '+ Two columns' },
    { type: 'spacer', label: '+ Spacer' },
  ]

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {types.map(t => (
        <button
          key={t.type}
          type="button"
          onClick={() => onAdd(newBlock(t.type))}
          className="px-4 py-2 rounded-lg border border-dashed border-peach-dark text-sm text-brown-light hover:bg-peach-light/40 hover:text-brown transition-colors"
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
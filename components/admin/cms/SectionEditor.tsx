'use client'

import { useState, useRef } from 'react'
import { Save, ImageIcon, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { SiteSection, SiteSettings } from '@/types/cms'
import { logAction } from '@/lib/log-client'

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium text-brown/60 uppercase tracking-wider mb-1">{children}</p>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label>{label}</Label>{children}</div>
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
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

function TextareaInput({ value, onChange, rows = 4, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-peach-light rounded-lg px-3 py-2 text-sm text-brown bg-white focus:outline-none focus:ring-2 focus:ring-peach resize-none"
    />
  )
}

async function uploadImage(file: File): Promise<string | null> {
  const form = new FormData()
  form.append('file', file)
  form.append('folder', 'cms')
  const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
  const json = await res.json()
  return json.url ?? null
}

function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
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
    <Field label={label}>
      <div className="flex items-center gap-3">
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="flex items-center gap-2 px-3 py-2 border border-peach-light rounded-lg text-sm text-brown-light hover:bg-peach-light/40 transition-colors"
        >
          <ImageIcon className="w-4 h-4" />
          {uploading ? 'Uploading…' : value ? 'Replace' : 'Upload image'}
        </button>
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-12 w-20 object-cover rounded border border-peach-light" />
        )}
      </div>
    </Field>
  )
}

function SaveButton({ saving, saved, onClick }: { saving: boolean; saved: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-2 px-4 py-2 bg-brown text-whitewash rounded-lg text-sm hover:bg-brown-light transition-colors disabled:opacity-60"
    >
      <Save className="w-4 h-4" />
      {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
    </button>
  )
}

// ─────────────────────────────────────────────
// Section editors
// ─────────────────────────────────────────────

function HeroEditor({ section }: { section: SiteSection }) {
  type C = { headline: string; subheadline: string; cta_text: string; cta_url: string; image_url: string }
  const [content, setContent] = useState<C>(section.content as C)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    await createClient().from('site_sections').update({ content }).eq('section_key', 'hero')
    await logAction({ action: 'update', entity: 'site_sections', entityId: section.id, entityName: 'Hero Banner' })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <Field label="Headline">
        <TextInput value={content.headline} onChange={v => setContent(c => ({ ...c, headline: v }))} placeholder="Wear what you mean." />
      </Field>
      <Field label="Subheadline">
        <TextInput value={content.subheadline} onChange={v => setContent(c => ({ ...c, subheadline: v }))} placeholder="Clean, expressive streetwear…" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="CTA button text">
          <TextInput value={content.cta_text} onChange={v => setContent(c => ({ ...c, cta_text: v }))} placeholder="Shop now" />
        </Field>
        <Field label="CTA button URL">
          <TextInput value={content.cta_url} onChange={v => setContent(c => ({ ...c, cta_url: v }))} placeholder="/shop" />
        </Field>
      </div>
      <ImageField label="Hero image" value={content.image_url} onChange={url => setContent(c => ({ ...c, image_url: url }))} />
      <SaveButton saving={saving} saved={saved} onClick={save} />
    </div>
  )
}

function AboutEditor({ section }: { section: SiteSection }) {
  type C = { heading: string; body: string; image_url: string }
  const [content, setContent] = useState<C>(section.content as C)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    await createClient().from('site_sections').update({ content }).eq('section_key', 'about')
    await logAction({ action: 'update', entity: 'site_sections', entityId: section.id, entityName: 'About Page' })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <Field label="Page heading">
        <TextInput value={content.heading} onChange={v => setContent(c => ({ ...c, heading: v }))} />
      </Field>
      <Field label="Body text">
        <TextareaInput value={content.body} onChange={v => setContent(c => ({ ...c, body: v }))} rows={6} placeholder="Tell your story…" />
      </Field>
      <ImageField label="Image" value={content.image_url} onChange={url => setContent(c => ({ ...c, image_url: url }))} />
      <SaveButton saving={saving} saved={saved} onClick={save} />
    </div>
  )
}

function BrandStatementEditor({ section }: { section: SiteSection }) {
  type C = { heading: string; body: string }
  const [content, setContent] = useState<C>(section.content as C)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    await createClient().from('site_sections').update({ content }).eq('section_key', 'brand_statement')
    await logAction({ action: 'update', entity: 'site_sections', entityId: section.id, entityName: 'Brand Statement' })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <Field label="Heading">
        <TextInput value={content.heading} onChange={v => setContent(c => ({ ...c, heading: v }))} />
      </Field>
      <Field label="Body">
        <TextareaInput value={content.body} onChange={v => setContent(c => ({ ...c, body: v }))} rows={3} />
      </Field>
      <SaveButton saving={saving} saved={saved} onClick={save} />
    </div>
  )
}

function SaleBannerEditor({ section }: { section: SiteSection }) {
  type C = { heading: string; subheading: string; cta_text: string; cta_url: string; is_visible: boolean }
  const [content, setContent] = useState<C>(section.content as C)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    await createClient().from('site_sections').update({ content }).eq('section_key', 'sale_banner')
    await logAction({ action: 'update', entity: 'site_sections', entityId: section.id, entityName: 'Sale Banner' })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm text-brown cursor-pointer">
        <input
          type="checkbox"
          checked={content.is_visible}
          onChange={e => setContent(c => ({ ...c, is_visible: e.target.checked }))}
          className="accent-brown"
        />
        Show sale banner on homepage
      </label>
      <Field label="Heading">
        <TextInput value={content.heading} onChange={v => setContent(c => ({ ...c, heading: v }))} />
      </Field>
      <Field label="Subheading">
        <TextInput value={content.subheading} onChange={v => setContent(c => ({ ...c, subheading: v }))} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Button text">
          <TextInput value={content.cta_text} onChange={v => setContent(c => ({ ...c, cta_text: v }))} />
        </Field>
        <Field label="Button URL">
          <TextInput value={content.cta_url} onChange={v => setContent(c => ({ ...c, cta_url: v }))} />
        </Field>
      </div>
      <SaveButton saving={saving} saved={saved} onClick={save} />
    </div>
  )
}

function GenericBodyEditor({ section }: { section: SiteSection }) {
  type C = { heading: string; body: string }
  const [content, setContent] = useState<C>(section.content as C)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    await createClient().from('site_sections').update({ content }).eq('section_key', section.section_key)
    await logAction({ action: 'update', entity: 'site_sections', entityId: section.id, entityName: section.label })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <Field label="Page heading">
        <TextInput value={content.heading} onChange={v => setContent(c => ({ ...c, heading: v }))} />
      </Field>
      <Field label="Body content">
        <TextareaInput value={content.body} onChange={v => setContent(c => ({ ...c, body: v }))} rows={8} />
      </Field>
      <SaveButton saving={saving} saved={saved} onClick={save} />
    </div>
  )
}

function FaqEditor({ section }: { section: SiteSection }) {
  type Item = { q: string; a: string }
  type C = { heading: string; items: Item[] }
  const [content, setContent] = useState<C>(section.content as C)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  function addItem() {
    setContent(c => ({ ...c, items: [...c.items, { q: '', a: '' }] }))
    setOpenIdx(content.items.length)
  }

  function removeItem(i: number) {
    setContent(c => ({ ...c, items: c.items.filter((_, idx) => idx !== i) }))
  }

  function updateItem(i: number, field: 'q' | 'a', value: string) {
    setContent(c => ({
      ...c,
      items: c.items.map((item, idx) => idx === i ? { ...item, [field]: value } : item),
    }))
  }

  async function save() {
    setSaving(true)
    await createClient().from('site_sections').update({ content }).eq('section_key', 'faq')
    await logAction({ action: 'update', entity: 'site_sections', entityId: section.id, entityName: 'FAQ' })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <Field label="Page heading">
        <TextInput value={content.heading} onChange={v => setContent(c => ({ ...c, heading: v }))} />
      </Field>
      <div className="space-y-2">
        {content.items.map((item, i) => (
          <div key={i} className="border border-peach-light rounded-xl overflow-hidden">
            <div
              className="flex items-center gap-2 px-4 py-3 bg-whitewash cursor-pointer"
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
            >
              <span className="flex-1 text-sm text-brown font-medium truncate">
                {item.q || `Question ${i + 1}`}
              </span>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); removeItem(i) }}
                className="p-1 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
              {openIdx === i
                ? <ChevronUp className="w-4 h-4 text-brown/40" />
                : <ChevronDown className="w-4 h-4 text-brown/40" />
              }
            </div>
            {openIdx === i && (
              <div className="p-4 space-y-3">
                <Field label="Question">
                  <TextInput value={item.q} onChange={v => updateItem(i, 'q', v)} placeholder="What is your return policy?" />
                </Field>
                <Field label="Answer">
                  <TextareaInput value={item.a} onChange={v => updateItem(i, 'a', v)} rows={3} placeholder="We accept returns within 14 days…" />
                </Field>
              </div>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-2 px-4 py-2 border border-dashed border-peach-dark rounded-lg text-sm text-brown-light hover:bg-peach-light/40 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add question
      </button>
      <SaveButton saving={saving} saved={saved} onClick={save} />
    </div>
  )
}

function ContactEditor({ section }: { section: SiteSection }) {
  type C = { heading: string; subheading: string; email: string }
  const [content, setContent] = useState<C>(section.content as C)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    await createClient().from('site_sections').update({ content }).eq('section_key', 'contact')
    await logAction({ action: 'update', entity: 'site_sections', entityId: section.id, entityName: 'Contact Page' })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <Field label="Heading">
        <TextInput value={content.heading} onChange={v => setContent(c => ({ ...c, heading: v }))} />
      </Field>
      <Field label="Subheading">
        <TextInput value={content.subheading} onChange={v => setContent(c => ({ ...c, subheading: v }))} />
      </Field>
      <Field label="Contact email">
        <TextInput value={content.email} onChange={v => setContent(c => ({ ...c, email: v }))} placeholder="hello@knownandworn.com" />
      </Field>
      <SaveButton saving={saving} saved={saved} onClick={save} />
    </div>
  )
}

// ─────────────────────────────────────────────
// Settings editor
// ─────────────────────────────────────────────

export function SettingsEditor({ settings }: { settings: SiteSettings }) {
  const [values, setValues] = useState(settings)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, updated_at, ...rest } = values
    await createClient().from('site_settings').update(rest).eq('id', 1)
    await logAction({ action: 'update', entity: 'site_settings', entityId: '1', entityName: 'Site Settings' })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-brown mb-3">Footer</h3>
        <Field label="Tagline">
          <TextareaInput value={values.footer_tagline} onChange={v => setValues(s => ({ ...s, footer_tagline: v }))} rows={2} />
        </Field>
      </div>
      <div>
        <h3 className="text-sm font-medium text-brown mb-3">Social links</h3>
        <div className="space-y-3">
          <Field label="Facebook URL">
            <TextInput value={values.facebook_url} onChange={v => setValues(s => ({ ...s, facebook_url: v }))} />
          </Field>
          <Field label="Email address">
            <TextInput value={values.email} onChange={v => setValues(s => ({ ...s, email: v }))} />
          </Field>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-brown mb-3">Marketplace links</h3>
        <div className="space-y-3">
          <Field label="TikTok Shop URL">
            <TextInput value={values.tiktok_url} onChange={v => setValues(s => ({ ...s, tiktok_url: v }))} placeholder="https://www.tiktok.com/…" />
          </Field>
          <Field label="Shopee URL">
            <TextInput value={values.shopee_url} onChange={v => setValues(s => ({ ...s, shopee_url: v }))} placeholder="https://shopee.ph/…" />
          </Field>
          <Field label="Lazada URL">
            <TextInput value={values.lazada_url} onChange={v => setValues(s => ({ ...s, lazada_url: v }))} placeholder="https://www.lazada.com.ph/…" />
          </Field>
        </div>
      </div>
      <SaveButton saving={saving} saved={saved} onClick={save} />
    </div>
  )
}

// ─────────────────────────────────────────────
// Dispatcher
// ─────────────────────────────────────────────

export function SectionEditor({ section }: { section: SiteSection }) {
  switch (section.section_key) {
    case 'hero':            return <HeroEditor section={section} />
    case 'about':           return <AboutEditor section={section} />
    case 'brand_statement': return <BrandStatementEditor section={section} />
    case 'sale_banner':     return <SaleBannerEditor section={section} />
    case 'faq':             return <FaqEditor section={section} />
    case 'contact':         return <ContactEditor section={section} />
    default:                return <GenericBodyEditor section={section} />
  }
}
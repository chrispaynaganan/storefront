'use client'

// app/(admin)/admin/collections/page.tsx

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { logAction, buildDiff } from '@/lib/log-client'
import { slugify } from '@/lib/utils'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
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

function TextareaInput(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={3}
      className="w-full bg-gray-100 rounded-2xl px-4 py-3 text-sm text-brown placeholder:text-brown/30 outline-none focus:ring-2 focus:ring-peach transition resize-none"
    />
  )
}

// ─── Collection modal ─────────────────────────────────────────────────────────

function CollectionModal({
  mode,
  collection,
  onClose,
  onSaved,
}: {
  mode: 'add' | 'edit'
  collection?: Collection
  onClose: () => void
  onSaved: () => void
}) {
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(collection?.name ?? '')
  const [slug, setSlug] = useState(collection?.slug ?? '')
  const [description, setDescription] = useState(collection?.description ?? '')
  const [sortOrder, setSortOrder] = useState(String(collection?.sort_order ?? 0))
  const [isActive, setIsActive] = useState(collection?.is_active ?? true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (mode === 'add') setSlug(slugify(name))
  }, [name, mode])

  async function handleSave() {
    if (!name || !slug) { setError('Name and slug are required.'); return }
    setSaving(true); setError('')
    try {
      let imageUrl = collection?.image_url ?? null
      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        fd.append('slug', `collections/${slug}`)
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Upload failed.')
        imageUrl = json.url
      }

      const payload = { name, slug, description, sort_order: parseInt(sortOrder) || 0, is_active: isActive, image_url: imageUrl }

      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from('users').select('full_name, role').eq('id', user?.id ?? '').single()

      if (mode === 'add') {
        const { data: newCol, error: e } = await supabase
          .from('collections').insert(payload).select('id').single()
        if (e) throw e
        await logAction({
          userId: user?.id, userName: profile?.full_name ?? user?.email, userRole: profile?.role,
          action: 'created', entity: 'collection', entityId: newCol?.id, entityName: name,
          metadata: { slug, is_active: isActive },
        })
      } else {
        const { error: e } = await supabase.from('collections').update(payload).eq('id', collection!.id)
        if (e) throw e
        const before: Record<string, any> = {
          name: collection!.name, slug: collection!.slug,
          description: collection!.description, is_active: collection!.is_active,
          sort_order: collection!.sort_order,
        }
        const after: Record<string, any> = {
          name, slug, description, is_active: isActive, sort_order: parseInt(sortOrder) || 0,
        }
        await logAction({
          userId: user?.id, userName: profile?.full_name ?? user?.email, userRole: profile?.role,
          action: 'updated', entity: 'collection', entityId: collection!.id, entityName: name,
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
          <h2 className="text-2xl font-bold text-brown">{mode === 'add' ? 'Add Collection' : 'Edit Collection'}</h2>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
            <svg className="w-5 h-5 text-brown/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-5">
          <Field label="Name"><TextInput placeholder="Hoodies" value={name} onChange={e => setName(e.target.value)} /></Field>
          <Field label="Slug (URL)"><TextInput placeholder="hoodies" value={slug} onChange={e => setSlug(e.target.value)} /></Field>
          <Field label="Description"><TextareaInput placeholder="Our hoodie collection" value={description} onChange={e => setDescription(e.target.value)} /></Field>
          <Field label="Sort Order"><TextInput type="number" placeholder="0" value={sortOrder} onChange={e => setSortOrder(e.target.value)} /></Field>

          <div className="flex flex-col gap-2">
            <h4 className="text-base font-semibold text-brown">Cover Image</h4>
            <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-peach transition">
              <p className="sm:hidden text-sm text-brown/60">Tap to add image</p>
              <p className="hidden sm:block text-sm text-brown/60">Drag image here or <span className="underline font-medium">browse</span></p>
              <p className="text-xs text-brown/30 mt-1">JPG, PNG, WEBP up to 5MB — auto-converted to WEBP</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
            {imageFile && <p className="text-xs text-brown/50">{imageFile.name}</p>}
            {collection?.image_url && !imageFile && (
              <img src={collection.image_url} alt="" className="w-20 h-20 rounded-xl object-cover border border-whitewash-off" />
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="accent-brown w-4 h-4" />
            <span className="text-sm text-brown/70">Active</span>
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}
          <button onClick={handleSave} disabled={saving} className="w-full bg-brown-light text-white font-semibold rounded-2xl py-3.5 flex items-center justify-center gap-2 hover:bg-brown transition disabled:opacity-50">
            {saving
              ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>}
            {mode === 'add' ? 'Add Collection' : 'Update Collection'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteConfirmModal({ name, onConfirm, onClose }: { name: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-brown">Delete collection?</h3>
        <p className="text-sm text-brown/60"><span className="font-semibold text-brown">{name}</span> will be permanently deleted.</p>
        <div className="flex gap-3 mt-2">
          <button onClick={onClose} className="flex-1 bg-gray-100 text-brown font-semibold rounded-2xl py-3 hover:bg-gray-200 transition text-sm">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-red-500 text-white font-semibold rounded-2xl py-3 hover:bg-red-600 transition text-sm">Delete</button>
        </div>
      </div>
    </div>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold', active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

// ─── Action buttons ───────────────────────────────────────────────────────────

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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminCollectionsPage() {
  const supabase = createClient()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<null | 'add' | 'edit'>(null)
  const [editItem, setEditItem] = useState<Collection | undefined>()
  const [deleteItem, setDeleteItem] = useState<Collection | undefined>()

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('collections').select('*').order('sort_order')
    setCollections((data as Collection[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(c: Collection) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('users').select('full_name, role').eq('id', user?.id ?? '').single()
    await supabase.from('collections').delete().eq('id', c.id)
    await logAction({
      userId: user?.id, userName: profile?.full_name ?? user?.email, userRole: profile?.role,
      action: 'deleted', entity: 'collection', entityId: c.id, entityName: c.name,
    })
    setDeleteItem(undefined)
    load()
  }

  return (
    <div className="px-5 py-8 md:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-brown tracking-tight">Collections</h1>
        <button onClick={() => { setEditItem(undefined); setModal('add') }} className="md:hidden w-12 h-12 rounded-2xl border-2 border-brown flex items-center justify-center hover:bg-brown hover:text-white transition">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        </button>
        <button onClick={() => { setEditItem(undefined); setModal('add') }} className="hidden md:flex items-center gap-2 border-2 border-brown text-brown font-semibold rounded-2xl px-5 py-2.5 text-sm hover:bg-brown hover:text-white transition">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Collection
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />)}</div>
      ) : collections.length === 0 ? (
        <div className="text-center py-20 text-brown/40 text-sm">No collections yet.</div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-4">
            {collections.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-whitewash-off p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {c.image_url
                    ? <img src={c.image_url} alt={c.name} className="w-14 h-14 rounded-xl object-cover bg-gray-100 shrink-0" />
                    : <div className="w-14 h-14 rounded-xl bg-gray-100 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-brown text-lg truncate">{c.name}</p>
                    <p className="text-xs text-brown/40 truncate">{c.slug}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <EditBtn onClick={() => { setEditItem(c); setModal('edit') }} />
                    <DeleteBtn onClick={() => setDeleteItem(c)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-50">
                  <div><p className="text-xs text-brown/40">Sort Order</p><p className="text-sm font-semibold text-brown">{c.sort_order}</p></div>
                  <div><p className="text-xs text-brown/40">Status</p><ActiveBadge active={c.is_active} /></div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block rounded-2xl border border-whitewash-off overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-whitewash-off">
                  {['Collection', 'Slug', 'Sort Order', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-brown/40 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {collections.map((c, i) => (
                  <tr key={c.id} className={cn('border-b border-whitewash-off last:border-0', i % 2 === 0 ? 'bg-white' : 'bg-whitewash/40')}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {c.image_url ? <img src={c.image_url} alt={c.name} className="w-10 h-10 rounded-xl object-cover bg-gray-100 shrink-0" /> : <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />}
                        <p className="font-semibold text-brown">{c.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-brown/60 text-xs font-mono">{c.slug}</td>
                    <td className="px-5 py-4 text-brown">{c.sort_order}</td>
                    <td className="px-5 py-4"><ActiveBadge active={c.is_active} /></td>
                    <td className="px-5 py-4"><div className="flex gap-2"><EditBtn onClick={() => { setEditItem(c); setModal('edit') }} /><DeleteBtn onClick={() => setDeleteItem(c)} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {modal && <CollectionModal mode={modal} collection={editItem} onClose={() => setModal(null)} onSaved={load} />}
      {deleteItem && <DeleteConfirmModal name={deleteItem.name} onConfirm={() => handleDelete(deleteItem)} onClose={() => setDeleteItem(undefined)} />}
    </div>
  )
}
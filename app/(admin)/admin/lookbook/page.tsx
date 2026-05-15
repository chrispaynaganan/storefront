'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { logAction } from '@/lib/log-client'
import { cn } from '@/lib/utils'

interface LookbookPhoto {
  id: string
  title: string | null
  caption: string | null
  image_url: string
  sort_order: number
  is_active: boolean
  created_at: string
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

function TextareaInput(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={2}
      className="w-full bg-gray-100 rounded-2xl px-4 py-3 text-sm text-brown placeholder:text-brown/30 outline-none focus:ring-2 focus:ring-peach transition resize-none"
    />
  )
}

function PhotoModal({
  mode,
  photo,
  nextSortOrder,
  onClose,
  onSaved,
}: {
  mode: 'add' | 'edit'
  photo?: LookbookPhoto
  nextSortOrder: number
  onClose: () => void
  onSaved: () => void
}) {
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState(photo?.title ?? '')
  const [caption, setCaption] = useState(photo?.caption ?? '')
  const [imageUrl, setImageUrl] = useState(photo?.image_url ?? '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(photo?.is_active ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleFileChange(file: File | null) {
    setImageFile(file)
    if (file) setImagePreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!imageUrl && !imageFile) { setError('An image is required.'); return }
    setSaving(true); setError('')
    try {
      let finalImageUrl = imageUrl

      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        fd.append('slug', `lookbook/${Date.now()}`)
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Upload failed.')
        finalImageUrl = json.url
      }

      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from('users').select('full_name, role').eq('id', user?.id ?? '').single()

      const payload = {
        title: title || null,
        caption: caption || null,
        image_url: finalImageUrl,
        is_active: isActive,
      }

      if (mode === 'add') {
        const { data: newPhoto, error: e } = await supabase
          .from('lookbook_photos')
          .insert({ ...payload, sort_order: nextSortOrder })
          .select('id')
          .single()
        if (e) throw e
        await logAction({
          userId: user?.id,
          userName: profile?.full_name ?? user?.email,
          userRole: profile?.role,
          action: 'created',
          entity: 'lookbook_photo',
          entityId: newPhoto?.id,
          entityName: title || 'Untitled photo',
        })
      } else {
        const { error: e } = await supabase
          .from('lookbook_photos')
          .update(payload)
          .eq('id', photo!.id)
        if (e) throw e
        await logAction({
          userId: user?.id,
          userName: profile?.full_name ?? user?.email,
          userRole: profile?.role,
          action: 'updated',
          entity: 'lookbook_photo',
          entityId: photo!.id,
          entityName: title || 'Untitled photo',
        })
      }

      onSaved(); onClose()
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[90dvh]">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <h2 className="text-2xl font-bold text-brown">{mode === 'add' ? 'Add Photo' : 'Edit Photo'}</h2>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
            <svg className="w-5 h-5 text-brown/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-5">

          {/* Image upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-brown/70 font-medium">Photo</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:border-peach transition"
            >
              {imagePreview || imageUrl ? (
                <img
                  src={imagePreview ?? imageUrl}
                  alt="Preview"
                  className="w-full max-h-64 object-cover"
                />
              ) : (
                <div className="p-8 text-center">
                  <svg className="w-8 h-8 text-brown/20 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 12a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                  <p className="text-sm text-brown/50">Click to upload photo</p>
                  <p className="text-xs text-brown/30 mt-1">JPG, PNG, WEBP — auto-converted to WebP</p>
                </div>
              )}
            </div>
            {(imagePreview || imageUrl) && (
              <button
                onClick={() => fileRef.current?.click()}
                className="text-xs text-brown/40 hover:text-brown underline text-left"
              >
                Replace image
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e.target.files?.[0] ?? null)} />
          </div>

          <Field label="Title (optional)">
            <TextInput placeholder="e.g. Summer 2025" value={title} onChange={e => setTitle(e.target.value)} />
          </Field>

          <Field label="Caption (optional)">
            <TextareaInput placeholder="A short caption shown below the photo..." value={caption} onChange={e => setCaption(e.target.value)} />
          </Field>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="accent-brown w-4 h-4"
            />
            <span className="text-sm text-brown/70">Visible on site</span>
            {isActive && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Live</span>}
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-brown-light text-white font-semibold rounded-2xl py-3.5 flex items-center justify-center gap-2 hover:bg-brown transition disabled:opacity-50"
          >
            {saving ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            )}
            {mode === 'add' ? 'Add Photo' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-brown">Delete photo?</h3>
        <p className="text-sm text-brown/60">This photo will be permanently removed from the lookbook.</p>
        <div className="flex gap-3 mt-2">
          <button onClick={onClose} className="flex-1 bg-gray-100 text-brown font-semibold rounded-2xl py-3 hover:bg-gray-200 transition text-sm">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-red-500 text-white font-semibold rounded-2xl py-3 hover:bg-red-600 transition text-sm">Delete</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminLookbookPage() {
  const supabase = createClient()
  const [photos, setPhotos] = useState<LookbookPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<null | 'add' | 'edit'>(null)
  const [editPhoto, setEditPhoto] = useState<LookbookPhoto | undefined>()
  const [deletePhoto, setDeletePhoto] = useState<LookbookPhoto | undefined>()

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('lookbook_photos')
      .select('*')
      .order('sort_order', { ascending: true })
    setPhotos((data as LookbookPhoto[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(photo: LookbookPhoto) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('users').select('full_name, role').eq('id', user?.id ?? '').single()
    await supabase.from('lookbook_photos').delete().eq('id', photo.id)
    await logAction({
      userId: user?.id,
      userName: profile?.full_name ?? user?.email,
      userRole: profile?.role,
      action: 'deleted',
      entity: 'lookbook_photo',
      entityId: photo.id,
      entityName: photo.title || 'Untitled photo',
    })
    setDeletePhoto(undefined)
    load()
  }

  async function toggleActive(photo: LookbookPhoto) {
    const isActive = !photo.is_active
    await supabase.from('lookbook_photos').update({ is_active: isActive }).eq('id', photo.id)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('users').select('full_name, role').eq('id', user?.id ?? '').single()
    await logAction({
      userId: user?.id,
      userName: profile?.full_name ?? user?.email,
      userRole: profile?.role,
      action: isActive ? 'published' : 'unpublished',
      entity: 'lookbook_photo',
      entityId: photo.id,
      entityName: photo.title || 'Untitled photo',
    })
    load()
  }

  async function movePhoto(photo: LookbookPhoto, direction: 'up' | 'down') {
    const idx = photos.findIndex(p => p.id === photo.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= photos.length) return

    const swap = photos[swapIdx]
    await Promise.all([
      supabase.from('lookbook_photos').update({ sort_order: swap.sort_order }).eq('id', photo.id),
      supabase.from('lookbook_photos').update({ sort_order: photo.sort_order }).eq('id', swap.id),
    ])
    load()
  }

  const nextSortOrder = photos.length > 0 ? Math.max(...photos.map(p => p.sort_order)) + 1 : 0

  return (
    <div className="px-5 py-8 md:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-brown tracking-tight">Lookbook</h1>
          <p className="text-sm text-brown/40 mt-1">{photos.filter(p => p.is_active).length} of {photos.length} photos visible</p>
        </div>
        <button
          onClick={() => { setEditPhoto(undefined); setModal('add') }}
          className="flex items-center gap-2 border-2 border-brown text-brown font-semibold rounded-2xl px-5 py-2.5 text-sm hover:bg-brown hover:text-white transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          <span className="hidden sm:inline">Add Photo</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-3/4 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-24 text-brown/40 text-sm">
          <svg className="w-10 h-10 text-brown/15 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M13.5 12a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
          No photos yet. Add your first lookbook shot.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              className={cn(
                'group relative bg-white rounded-2xl overflow-hidden border transition',
                photo.is_active ? 'border-whitewash-off' : 'border-gray-100 opacity-50'
              )}
            >
              {/* Image */}
              <div className="aspect-3/4 bg-gray-50">
                <img src={photo.image_url} alt={photo.title ?? 'Lookbook photo'} className="w-full h-full object-cover" />
              </div>

              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100">
                {/* Top: visibility + delete */}
                <div className="flex justify-between">
                  <button
                    onClick={() => toggleActive(photo)}
                    className={cn(
                      'text-xs font-semibold px-2.5 py-1 rounded-full transition',
                      photo.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    )}
                  >
                    {photo.is_active ? 'Live' : 'Hidden'}
                  </button>
                  <button
                    onClick={() => setDeletePhoto(photo)}
                    className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Bottom: reorder + edit */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-1">
                    <button
                      onClick={() => movePhoto(photo, 'up')}
                      disabled={idx === 0}
                      className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-brown disabled:opacity-30 hover:bg-white transition"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                      onClick={() => movePhoto(photo, 'down')}
                      disabled={idx === photos.length - 1}
                      className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-brown disabled:opacity-30 hover:bg-white transition"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                  <button
                    onClick={() => { setEditPhoto(photo); setModal('edit') }}
                    className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-brown hover:bg-white transition"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                </div>
              </div>

              {/* Caption below image */}
              {(photo.title || photo.caption) && (
                <div className="px-3 py-2.5">
                  {photo.title && <p className="text-xs font-semibold text-brown truncate">{photo.title}</p>}
                  {photo.caption && <p className="text-xs text-brown/40 truncate mt-0.5">{photo.caption}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <PhotoModal
          mode={modal}
          photo={editPhoto}
          nextSortOrder={nextSortOrder}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}
      {deletePhoto && (
        <DeleteConfirmModal onConfirm={() => handleDelete(deletePhoto)} onClose={() => setDeletePhoto(undefined)} />
      )}
    </div>
  )
}
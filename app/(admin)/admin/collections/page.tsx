'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { slugify } from '@/lib/utils'

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('collections').select('*').order('sort_order')
    setCollections(data ?? [])
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setEditing(null)
    setName(''); setSlug(''); setDescription(''); setImages([]); setIsActive(true)
    setShowForm(true)
  }

  function openEdit(col: any) {
    setEditing(col)
    setName(col.name); setSlug(col.slug); setDescription(col.description ?? '')
    setImages(col.image_url ? [col.image_url] : []); setIsActive(col.is_active)
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const data = { name, slug, description, image_url: images[0] ?? null, is_active: isActive }
    if (editing) {
      await supabase.from('collections').update(data).eq('id', editing.id)
    } else {
      await supabase.from('collections').insert({ ...data, sort_order: collections.length + 1 })
    }
    await load()
    setShowForm(false)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this collection?')) return
    const supabase = createClient()
    await supabase.from('collections').delete().eq('id', id)
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light text-[#3B1F0E]">Collections</h1>
          <p className="text-sm text-[#6B3A22] mt-1">{collections.length} total</p>
        </div>
        <Button onClick={openNew}
          className="bg-[#3B1F0E] text-white hover:bg-[#6B3A22] rounded-lg px-5 py-2.5 text-sm">
          + Add collection
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-[#FFE8D6] p-6 mb-8 max-w-2xl">
          <h2 className="text-sm font-medium text-[#3B1F0E] mb-4">
            {editing ? `Edit — ${editing.name}` : 'New collection'}
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Name" value={name}
              onChange={e => { setName(e.target.value); if (!editing) setSlug(slugify(e.target.value)) }} />
            <Input label="Slug" value={slug} onChange={e => setSlug(e.target.value)} />
            <Textarea label="Description" value={description} onChange={e => setDescription(e.target.value)} />
            <div>
              <p className="text-sm text-[#3B1F0E] mb-1.5">Cover image</p>
              <ImageUploader value={images} onChange={setImages} />
            </div>
            <Toggle checked={isActive} onChange={setIsActive} label="Active (visible on store)" />
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}
                className="bg-[#3B1F0E] text-white hover:bg-[#6B3A22] px-6 py-2.5 rounded-lg">
                {saving ? 'Saving...' : editing ? 'Save changes' : 'Add collection'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}
                className="border-[#3B1F0E] text-[#3B1F0E] px-6 py-2.5 rounded-lg">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl border border-[#FFE8D6] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAF7F4] border-b border-[#FFE8D6]">
            <tr>
              {['Collection', 'Slug', 'Status', ''].map(h => (
                <th key={h} className="text-left text-xs text-[#6B3A22] font-medium px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#FFE8D6]">
            {collections.map(col => (
              <tr key={col.id} className="hover:bg-[#FAF7F4] transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F2EDE8] overflow-hidden flex-shrink-0">
                      {col.image_url && (
                        <img src={col.image_url} alt={col.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <p className="font-medium text-[#3B1F0E]">{col.name}</p>
                  </div>
                </td>
                <td className="px-5 py-4 text-[#6B3A22]">{col.slug}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${col.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {col.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(col)}
                      className="text-xs text-[#6B3A22] hover:text-[#3B1F0E] underline">Edit</button>
                    <button onClick={() => handleDelete(col.id)}
                      className="text-xs text-red-400 hover:text-red-600 underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {collections.length === 0 && (
          <div className="py-16 text-center text-sm text-[#6B3A22]">No collections yet.</div>
        )}
      </div>
    </div>
  )
}
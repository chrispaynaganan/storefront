'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit2, Trash2, Globe, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { logAction } from '@/lib/log-client'
import type { SitePage } from '@/types/cms'

export function PagesListClient({ pages: initial }: { pages: SitePage[] }) {
  const router = useRouter()
  const [pages, setPages] = useState(initial)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function titleToSlug(t: string) {
    return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  async function handleCreate() {
    if (!newTitle.trim() || !newSlug.trim()) {
      setError('Title and slug are required.')
      return
    }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data, error: err } = await supabase
      .from('site_pages')
      .insert({ title: newTitle.trim(), slug: newSlug.trim(), blocks: [], is_published: false })
      .select()
      .single()
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    await logAction({ action: 'create', entity: 'site_pages', entityId: data.id, entityName: data.title })
    setLoading(false)
    setCreating(false)
    setNewTitle('')
    setNewSlug('')
    router.push(`/admin/pages/${data.id}`)
  }

  async function handleTogglePublish(page: SitePage) {
    const supabase = createClient()
    await supabase
      .from('site_pages')
      .update({ is_published: !page.is_published })
      .eq('id', page.id)
    await logAction({
      action: 'update',
      entity: 'site_pages',
      entityId: page.id,
      entityName: page.title,
      changes: { is_published: { from: page.is_published, to: !page.is_published } },
    })
    setPages(prev =>
      prev.map(p => p.id === page.id ? { ...p, is_published: !p.is_published } : p)
    )
  }

  async function handleDelete(page: SitePage) {
    if (!confirm(`Delete "${page.title}"? This cannot be undone.`)) return
    const supabase = createClient()
    await supabase.from('site_pages').delete().eq('id', page.id)
    await logAction({ action: 'delete', entity: 'site_pages', entityId: page.id, entityName: page.title })
    setPages(prev => prev.filter(p => p.id !== page.id))
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-brown-light">{pages.length} custom page{pages.length !== 1 ? 's' : ''}</p>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brown text-whitewash rounded-lg text-sm hover:bg-brown-light transition-colors"
        >
          <Plus className="w-4 h-4" />
          New page
        </button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="bg-white border border-peach-light rounded-xl p-5 mb-4 space-y-3">
          <h3 className="text-sm font-medium text-brown">New custom page</h3>
          <div>
            <label className="text-xs text-brown/60 uppercase tracking-wider mb-1 block">Title</label>
            <input
              autoFocus
              type="text"
              value={newTitle}
              onChange={e => {
                setNewTitle(e.target.value)
                setNewSlug(titleToSlug(e.target.value))
              }}
              placeholder="e.g. Summer Campaign"
              className="w-full border border-peach-light rounded-lg px-3 py-2 text-sm text-brown bg-white focus:outline-none focus:ring-2 focus:ring-peach"
            />
          </div>
          <div>
            <label className="text-xs text-brown/60 uppercase tracking-wider mb-1 block">Slug (URL path)</label>
            <div className="flex items-center border border-peach-light rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-peach">
              <span className="px-3 py-2 bg-whitewash text-sm text-brown/40 border-r border-peach-light">
                knownandworn.com/
              </span>
              <input
                type="text"
                value={newSlug}
                onChange={e => setNewSlug(e.target.value)}
                className="flex-1 px-3 py-2 text-sm text-brown bg-white focus:outline-none"
              />
            </div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCreate}
              disabled={loading}
              className="px-4 py-2 bg-brown text-whitewash rounded-lg text-sm hover:bg-brown-light transition-colors disabled:opacity-60"
            >
              {loading ? 'Creating…' : 'Create page'}
            </button>
            <button
              type="button"
              onClick={() => { setCreating(false); setNewTitle(''); setNewSlug(''); setError('') }}
              className="px-4 py-2 border border-peach-light rounded-lg text-sm text-brown-light hover:text-brown transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Pages table */}
      {pages.length === 0 && !creating ? (
        <div className="text-center py-16 border border-dashed border-peach-light rounded-xl">
          <p className="text-brown-light text-sm mb-3">No custom pages yet.</p>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="text-sm text-brown underline underline-offset-2"
          >
            Create your first page
          </button>
        </div>
      ) : (
        <div className="border border-peach-light rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-whitewash border-b border-peach-light">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-brown/60 uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-brown/60 uppercase tracking-wider">Slug</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-brown/60 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-brown/60 uppercase tracking-wider">Updated</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-peach-light bg-white">
              {pages.map(page => (
                <tr key={page.id} className="hover:bg-whitewash/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-brown">{page.title}</td>
                  <td className="px-4 py-3 text-brown/50 font-mono text-xs">/{page.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                      page.is_published
                        ? 'bg-green-50 text-green-700'
                        : 'bg-peach-light text-brown-light'
                    }`}>
                      {page.is_published
                        ? <><Globe className="w-3 h-3" /> Published</>
                        : <><EyeOff className="w-3 h-3" /> Draft</>
                      }
                    </span>
                  </td>
                  <td className="px-4 py-3 text-brown/50 text-xs">
                    {new Date(page.updated_at).toLocaleDateString('en-PH', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Link
                        href={`/admin/pages/${page.id}`}
                        className="p-1.5 rounded hover:bg-peach-light/60 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-brown" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(page)}
                        title={page.is_published ? 'Unpublish' : 'Publish'}
                        className="p-1.5 rounded hover:bg-peach-light/60 transition-colors"
                      >
                        {page.is_published
                          ? <EyeOff className="w-4 h-4 text-brown-light" />
                          : <Globe className="w-4 h-4 text-green-600" />
                        }
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(page)}
                        className="p-1.5 rounded hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
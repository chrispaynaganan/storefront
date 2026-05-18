'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Globe, EyeOff, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { logAction } from '@/lib/log-client'
import { BlockCard, AddBlockStrip } from '@/components/admin/cms/BlockEditor'
import type { SitePage, Block } from '@/types/cms'

export function PageEditorClient({ page: initial }: { page: SitePage }) {
  const [title, setTitle] = useState(initial.title)
  const [slug, setSlug] = useState(initial.slug)
  const [blocks, setBlocks] = useState<Block[]>(initial.blocks)
  const [published, setPublished] = useState(initial.is_published)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [slugError, setSlugError] = useState('')

  const updateBlock = useCallback((index: number, updated: Block) => {
    setBlocks(prev => prev.map((b, i) => (i === index ? updated : b)))
  }, [])

  const deleteBlock = useCallback((index: number) => {
    setBlocks(prev => prev.filter((_, i) => i !== index))
  }, [])

  const moveBlock = useCallback((index: number, dir: 'up' | 'down') => {
    setBlocks(prev => {
      const next = [...prev]
      const swap = dir === 'up' ? index - 1 : index + 1
      if (swap < 0 || swap >= next.length) return prev
      ;[next[index], next[swap]] = [next[swap], next[index]]
      return next
    })
  }, [])

  const addBlock = useCallback((block: Block) => {
    setBlocks(prev => [...prev, block])
  }, [])

  async function handleSave() {
    setSaving(true)
    setSlugError('')
    const { error } = await createClient()
      .from('site_pages')
      .update({ title, slug, blocks })
      .eq('id', initial.id)
    if (error) {
      if (error.message.includes('unique') || error.message.includes('slug')) {
        setSlugError('This slug is already taken. Choose a different one.')
      }
      setSaving(false)
      return
    }
    await logAction({ action: 'update', entity: 'site_pages', entityId: initial.id, entityName: title })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  async function handleTogglePublish() {
    setPublishing(true)
    await createClient()
      .from('site_pages')
      .update({ is_published: !published })
      .eq('id', initial.id)
    await logAction({
      action: 'update',
      entity: 'site_pages',
      entityId: initial.id,
      entityName: title,
      changes: { is_published: { from: published, to: !published } },
    })
    setPublished(p => !p)
    setPublishing(false)
  }

  return (
    <div className="min-h-screen bg-whitewash">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-peach-light px-6 py-3 flex items-center gap-4">
        <Link
          href="/admin/pages"
          className="flex items-center gap-1.5 text-sm text-brown-light hover:text-brown transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Pages
        </Link>

        <span className="text-peach-light">|</span>

        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="flex-1 text-base font-medium text-brown bg-transparent focus:outline-none"
          placeholder="Page title"
        />

        <div className="flex items-center gap-2 ml-auto">
          {published && (
            <a
              href={`/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-brown-light hover:text-brown transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View live
            </a>
          )}

          <button
            type="button"
            onClick={handleTogglePublish}
            disabled={publishing}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-colors disabled:opacity-60 ${
              published
                ? 'border-peach-light text-brown-light hover:border-brown hover:text-brown'
                : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
            }`}
          >
            {published
              ? <><EyeOff className="w-3.5 h-3.5" /> Unpublish</>
              : <><Globe className="w-3.5 h-3.5" /> {publishing ? 'Publishing…' : 'Publish'}</>
            }
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-1.5 bg-brown text-whitewash rounded-lg text-sm hover:bg-brown-light transition-colors disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Slug field */}
        <div className="bg-white border border-peach-light rounded-xl p-4">
          <label className="text-xs font-medium text-brown/60 uppercase tracking-wider mb-2 block">
            URL slug
          </label>
          <div className="flex items-center border border-peach-light rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-peach">
            <span className="px-3 py-2 bg-whitewash text-sm text-brown/40 border-r border-peach-light whitespace-nowrap">
              knownandworn.com/
            </span>
            <input
              type="text"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              className="flex-1 px-3 py-2 text-sm text-brown bg-white focus:outline-none"
            />
          </div>
          {slugError && <p className="text-xs text-red-500 mt-1.5">{slugError}</p>}
          <p className="text-xs text-brown/40 mt-1.5">Use lowercase letters, numbers, and hyphens only.</p>
        </div>

        {/* Status banner */}
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm ${
          published
            ? 'bg-green-50 text-green-700 border border-green-100'
            : 'bg-peach-light/40 text-brown-light border border-peach-light'
        }`}>
          {published
            ? <><Globe className="w-4 h-4" /> Live at <span className="font-mono text-xs ml-1">/{slug}</span></>
            : <><EyeOff className="w-4 h-4" /> Draft — not visible to visitors</>
          }
        </div>

        {/* Blocks */}
        <div className="space-y-3">
          {blocks.length === 0 && (
            <div className="text-center py-12 border border-dashed border-peach-light rounded-xl">
              <p className="text-sm text-brown-light mb-1">This page has no blocks yet.</p>
              <p className="text-xs text-brown/40">Add a block below to start building.</p>
            </div>
          )}
          {blocks.map((block, i) => (
            <BlockCard
              key={block.id}
              block={block}
              index={i}
              total={blocks.length}
              onChange={updated => updateBlock(i, updated)}
              onDelete={() => deleteBlock(i)}
              onMove={dir => moveBlock(i, dir)}
            />
          ))}
        </div>

        {/* Add block */}
        <div className="bg-white border border-peach-light rounded-xl p-4">
          <p className="text-xs font-medium text-brown/60 uppercase tracking-wider mb-3">Add block</p>
          <AddBlockStrip onAdd={addBlock} />
        </div>

        {/* Bottom save */}
        <div className="flex justify-end pb-8">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-brown text-whitewash rounded-lg text-sm hover:bg-brown-light transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save page'}
          </button>
        </div>
      </div>
    </div>
  )
}
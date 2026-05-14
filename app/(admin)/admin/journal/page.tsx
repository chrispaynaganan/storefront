'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { logAction, buildDiff } from '@/lib/log-client'
import { cn } from '@/lib/utils'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface JournalPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  category: string | null
  cover_image_url: string | null
  is_published: boolean
  published_at: string | null
  created_at: string
}

const CATEGORIES = ['Craft', 'Style', 'Brand', 'Behind the Scenes', 'Community']

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
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
      rows={3}
      className="w-full bg-gray-100 rounded-2xl px-4 py-3 text-sm text-brown placeholder:text-brown/30 outline-none focus:ring-2 focus:ring-peach transition resize-none"
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

function RichTextEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[300px] px-4 py-3 text-sm text-brown outline-none',
      },
    },
  })

  if (!editor) return null

  const ToolbarBtn = ({ onClick, active, children }: { onClick: () => void; active?: boolean; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
        active ? 'bg-brown text-whitewash' : 'text-brown/60 hover:text-brown hover:bg-gray-100'
      }`}
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

function PostModal({
  mode,
  post,
  onClose,
  onSaved,
}: {
  mode: 'add' | 'edit'
  post?: JournalPost
  onClose: () => void
  onSaved: () => void
}) {
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [content, setContent] = useState(post?.content ?? '')
  const [category, setCategory] = useState(post?.category ?? '')
  const [isPublished, setIsPublished] = useState(post?.is_published ?? false)
  const [coverImageUrl, setCoverImageUrl] = useState(post?.cover_image_url ?? '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (mode === 'add') setSlug(slugify(title))
  }, [title, mode])

 async function handleSave() {
    if (!title || !slug) { setError('Title and slug are required.'); return }
    setSaving(true); setError('')
    try {
      let coverUrl = coverImageUrl

      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        fd.append('slug', `journal/${slug}`)
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Upload failed.')
        coverUrl = json.url
      }

      const payload = {
        title,
        slug,
        excerpt: excerpt || null,
        content: content || null,
        category: category || null,
        cover_image_url: coverUrl || null,
        is_published: isPublished,
        published_at: isPublished ? (post?.published_at ?? new Date().toISOString()) : null,
      }

      // Get current user for logging
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase
        .from('users')
        .select('full_name, role')
        .eq('id', user?.id ?? '')
        .single()

      if (mode === 'add') {
        const { data: newPost, error: e } = await supabase
          .from('journal_posts')
          .insert(payload)
          .select('id')
          .single()
        if (e) throw e
        await logAction({
          userId: user?.id,
          userName: profile?.full_name ?? user?.email,
          userRole: profile?.role,
          action: 'created',
          entity: 'journal_post',
          entityId: newPost?.id,
          entityName: title,
          changes: null,
          metadata: { category: category || null, is_published: isPublished },
        })
      } else {
        const { error: e } = await supabase
          .from('journal_posts')
          .update(payload)
          .eq('id', post!.id)
        if (e) throw e
        const before: Record<string, any> = {
          title: post!.title, slug: post!.slug, excerpt: post!.excerpt,
          category: post!.category, is_published: post!.is_published,
          cover_image_url: post!.cover_image_url,
        }
        const after: Record<string, any> = {
          title, slug, excerpt: excerpt || null,
          category: category || null, is_published: isPublished,
          cover_image_url: coverUrl || null,
        }
        await logAction({
          userId: user?.id,
          userName: profile?.full_name ?? user?.email,
          userRole: profile?.role,
          action: 'updated',
          entity: 'journal_post',
          entityId: post!.id,
          entityName: title,
          changes: buildDiff(before, after),
        })
      }

      onSaved(); onClose()
    } catch (e: any) {
      const msg = e.message ?? ''
      if (msg.includes('row-level security') || msg.includes('violates')) {
        setError('You don\'t have permission to do this. Make sure you\'re logged in as an admin.')
      } else if (msg.includes('duplicate') || msg.includes('unique')) {
        setError('A post with this slug already exists. Try a different title or slug.')
      } else {
        setError(msg || 'Something went wrong. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-3xl sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[90dvh] sm:max-h-[92vh]">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <h2 className="text-2xl font-bold text-brown">{mode === 'add' ? 'New Post' : 'Edit Post'}</h2>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
            <svg className="w-5 h-5 text-brown/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-5">

          <Field label="Title">
            <TextInput placeholder="Why we use heavyweight cotton" value={title} onChange={e => setTitle(e.target.value)} />
          </Field>

          <Field label="Slug (URL)">
            <TextInput
              placeholder="why-we-use-heavyweight-cotton"
              value={slug}
              onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
            />
          </Field>

          <Field label="Category">
            <SelectInput value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Select category...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </SelectInput>
          </Field>

          <Field label="Excerpt">
            <TextareaInput
              placeholder="A short summary shown on the journal index page..."
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
            />
          </Field>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-brown/70 font-medium">Cover Image</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-2xl p-5 text-center cursor-pointer hover:border-peach transition"
            >
              {coverImageUrl && !imageFile ? (
                <img src={coverImageUrl} alt="Cover" className="w-full h-40 object-cover rounded-xl mb-2" />
              ) : imageFile ? (
                <p className="text-sm text-brown/60">{imageFile.name}</p>
              ) : (
                <>
                  <p className="text-sm text-brown/60">Drag image here or <span className="underline font-medium">browse</span></p>
                  <p className="text-xs text-brown/30 mt-1">JPG, PNG, WEBP up to 5MB — auto-converted to WEBP</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-brown/70 font-medium">Content</label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={e => setIsPublished(e.target.checked)}
              className="accent-brown w-4 h-4"
            />
            <span className="text-sm text-brown/70">Published</span>
            {isPublished && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Live</span>}
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
            {mode === 'add' ? 'Publish Post' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteConfirmModal({ title, onConfirm, onClose }: { title: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-brown">Delete post?</h3>
        <p className="text-sm text-brown/60"><span className="font-semibold text-brown">{title}</span> will be permanently deleted.</p>
        <div className="flex gap-3 mt-2">
          <button onClick={onClose} className="flex-1 bg-gray-100 text-brown font-semibold rounded-2xl py-3 hover:bg-gray-200 transition text-sm">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-red-500 text-white font-semibold rounded-2xl py-3 hover:bg-red-600 transition text-sm">Delete</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminJournalPage() {
  const supabase = createClient()
  const [posts, setPosts] = useState<JournalPost[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<null | 'add' | 'edit'>(null)
  const [editPost, setEditPost] = useState<JournalPost | undefined>()
  const [deletePost, setDeletePost] = useState<JournalPost | undefined>()

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('journal_posts')
      .select('*')
      .order('created_at', { ascending: false })
    setPosts((data as JournalPost[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(post: JournalPost) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('users').select('full_name, role').eq('id', user?.id ?? '').single()
    await supabase.from('journal_posts').delete().eq('id', post.id)
    await logAction({
      userId: user?.id,
      userName: profile?.full_name ?? user?.email,
      userRole: profile?.role,
      action: 'deleted',
      entity: 'journal_post',
      entityId: post.id,
      entityName: post.title,
    })
    setDeletePost(undefined)
    load()
  }

  async function togglePublish(post: JournalPost) {
    const isPublished = !post.is_published
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('users').select('full_name, role').eq('id', user?.id ?? '').single()
    await supabase
      .from('journal_posts')
      .update({
        is_published: isPublished,
        published_at: isPublished ? (post.published_at ?? new Date().toISOString()) : null,
      })
      .eq('id', post.id)
    await logAction({
      userId: user?.id,
      userName: profile?.full_name ?? user?.email,
      userRole: profile?.role,
      action: isPublished ? 'published' : 'unpublished',
      entity: 'journal_post',
      entityId: post.id,
      entityName: post.title,
    })
    load()
  }

  return (
    <div className="px-5 py-8 md:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-brown tracking-tight">Journal</h1>
        <button
          onClick={() => { setEditPost(undefined); setModal('add') }}
          className="md:hidden w-12 h-12 rounded-2xl border-2 border-brown flex items-center justify-center hover:bg-brown hover:text-white transition"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        </button>
        <button
          onClick={() => { setEditPost(undefined); setModal('add') }}
          className="hidden md:flex items-center gap-2 border-2 border-brown text-brown font-semibold rounded-2xl px-5 py-2.5 text-sm hover:bg-brown hover:text-white transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          New Post
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />)}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-brown/40 text-sm">No posts yet. Write your first one.</div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-4">
            {posts.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-whitewash-off p-4 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  {p.cover_image_url && (
                    <img src={p.cover_image_url} alt={p.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-brown truncate">{p.title}</p>
                    {p.category && <p className="text-xs text-brown/40 mt-0.5">{p.category}</p>}
                    {p.excerpt && <p className="text-xs text-brown/50 mt-1 line-clamp-2">{p.excerpt}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                  <button
                    onClick={() => togglePublish(p)}
                    className={cn(
                      'text-xs font-semibold px-3 py-1 rounded-full transition',
                      p.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    )}
                  >
                    {p.is_published ? 'Published' : 'Draft'}
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditPost(p); setModal('edit') }} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition text-brown/60 hover:text-brown">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => setDeletePost(p)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-red-50 transition text-red-400 hover:text-red-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block rounded-2xl border border-whitewash-off overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-whitewash-off">
                  {['Post', 'Category', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-brown/40 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {posts.map((p, i) => (
                  <tr key={p.id} className={cn('border-b border-whitewash-off last:border-0', i % 2 === 0 ? 'bg-white' : 'bg-whitewash/40')}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {p.cover_image_url ? (
                          <img src={p.cover_image_url} alt={p.title} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
                        )}
                        <div>
                          <p className="font-semibold text-brown">{p.title}</p>
                          <p className="text-xs text-brown/40">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-brown/60">{p.category ?? '—'}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => togglePublish(p)}
                        className={cn(
                          'text-xs font-semibold px-3 py-1 rounded-full transition hover:opacity-80',
                          p.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        )}
                      >
                        {p.is_published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-brown/50 text-xs">
                      {p.published_at
                        ? new Date(p.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditPost(p); setModal('edit') }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-brown/50 hover:text-brown">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={() => setDeletePost(p)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition text-red-400 hover:text-red-600">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {modal && (
        <PostModal mode={modal} post={editPost} onClose={() => setModal(null)} onSaved={load} />
      )}
      {deletePost && (
        <DeleteConfirmModal title={deletePost.title} onConfirm={() => handleDelete(deletePost)} onClose={() => setDeletePost(undefined)} />
      )}
    </div>
  )
}
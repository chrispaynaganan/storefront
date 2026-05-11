'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { User } from '@/types'

export function ProfileForm({ user }: { user: User | null }) {
  const router = useRouter()
  const [fullName, setFullName] = useState(user?.full_name ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `avatars/${user.id}.${ext}`
    const { error } = await supabase.storage.from('products').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('products').getPublicUrl(path)
      setAvatarUrl(data.publicUrl)
    }
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    await supabase.from('users').update({ full_name: fullName, avatar_url: avatarUrl }).eq('id', user?.id)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setSaving(false)
    router.refresh()
  }

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initials = (user?.full_name ?? user?.email ?? 'U')[0].toUpperCase()

  return (
    <div className="max-w-md space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-peach flex items-center justify-center shrink-0">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
          ) : (
            <span className="text-brown font-bold text-xl">{initials}</span>
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-sm text-brown underline hover:text-brown-light transition-colors disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Change photo'}
          </button>
          <p className="text-xs text-brown/40 mt-0.5">JPG or PNG, max 2MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full name"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
        />
        <Input
          label="Email"
          value={user?.email ?? ''}
          disabled
          className="opacity-60 cursor-not-allowed"
        />
        <Button
          type="submit"
          disabled={saving}
          className="bg-brown text-whitewash hover:bg-brown-light px-6 py-2.5 rounded-lg"
        >
          {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save changes'}
        </Button>
      </form>

      <div className="border-t border-peach-light pt-6">
        <p className="text-sm font-medium text-brown mb-1">Sign out</p>
        <p className="text-xs text-brown-light mb-3">You will be signed out of your account.</p>
        <Button
          type="button"
          variant="outline"
          onClick={handleLogout}
          disabled={loggingOut}
          className="border-brown text-brown px-6 py-2.5 rounded-lg"
        >
          {loggingOut ? 'Signing out...' : 'Sign out'}
        </Button>
      </div>
    </div>
  )
}
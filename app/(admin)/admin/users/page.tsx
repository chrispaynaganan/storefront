'use client'

import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface User {
  id: string
  email: string
  full_name: string | null
  role: string
  is_active: boolean
  avatar_url: string | null
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

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className="w-full appearance-none bg-gray-100 rounded-2xl px-4 py-3 text-sm text-brown outline-none focus:ring-2 focus:ring-peach transition pr-10" />
      <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize',
      role === 'admin' ? 'bg-brown/10 text-brown' : 'bg-gray-100 text-gray-500'
    )}>
      {role}
    </span>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold', active ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500')}>
      {active ? 'Active' : 'Suspended'}
    </span>
  )
}

function EditBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-brown/50 hover:text-brown">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
    </button>
  )
}

function EditUserModal({ user, onClose, onSaved }: { user: User; onClose: () => void; onSaved: () => void }) {
  const [role, setRole] = useState(user.role)
  const [isActive, setIsActive] = useState(user.is_active)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, role, is_active: isActive }),
    })
    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[90dvh]">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-brown">Edit Customer</h2>
            <p className="text-xs text-brown/40 mt-0.5 truncate max-w-55">{user.email}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
            <svg className="w-5 h-5 text-brown/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-5">
          <div className="flex items-center gap-3 bg-whitewash rounded-2xl p-4">
            {user.avatar_url
              ? <img src={user.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
              : <div className="w-12 h-12 rounded-full bg-peach flex items-center justify-center text-brown font-bold text-lg shrink-0">{(user.full_name ?? user.email)[0].toUpperCase()}</div>}
            <div className="min-w-0">
              <p className="font-semibold text-brown truncate">{user.full_name ?? 'No name'}</p>
              <p className="text-xs text-brown/40 truncate">{user.email}</p>
              <p className="text-xs text-brown/30 mt-0.5">Joined {formatDate(user.created_at)}</p>
            </div>
          </div>

          <Field label="Role">
            <SelectInput value={role} onChange={e => setRole(e.target.value)}>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </SelectInput>
          </Field>

          <label className="flex items-center gap-3 cursor-pointer bg-gray-50 rounded-2xl px-4 py-3">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="accent-brown w-4 h-4" />
            <div>
              <p className="text-sm font-semibold text-brown">Account active</p>
              <p className="text-xs text-brown/40">Uncheck to suspend this customer's account</p>
            </div>
          </label>

          <button onClick={handleSave} disabled={saving} className="w-full bg-brown-light text-white font-semibold rounded-2xl py-3.5 flex items-center justify-center gap-2 hover:bg-brown transition disabled:opacity-50">
            {saving ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> : null}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [editUser, setEditUser] = useState<User | undefined>()
  const PER_PAGE = 15

  async function load() {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), search })
    const res = await fetch(`/api/admin/users?${params}`)
    const json = await res.json()
    setUsers(json.data ?? [])
    setTotal(json.count ?? 0)
    setLoading(false)
  }

  useEffect(() => { load() }, [page, search])

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="px-5 py-8 md:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-brown tracking-tight">Customers</h1>
      </div>

      <div className="relative mb-6 max-w-sm">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input
          type="search"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full bg-white border border-whitewash-off rounded-2xl pl-10 pr-4 py-3 text-sm text-brown placeholder:text-brown/30 outline-none focus:ring-2 focus:ring-peach transition"
        />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />)}</div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 text-brown/40 text-sm">No customers found.</div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-4">
            {users.map(u => (
              <div key={u.id} className="bg-white rounded-2xl border border-whitewash-off p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {u.avatar_url
                    ? <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                    : <div className="w-10 h-10 rounded-full bg-peach flex items-center justify-center text-brown font-bold shrink-0">{(u.full_name ?? u.email)[0].toUpperCase()}</div>}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-brown truncate">{u.full_name ?? 'No name'}</p>
                    <p className="text-xs text-brown/40 truncate">{u.email}</p>
                  </div>
                  <EditBtn onClick={() => setEditUser(u)} />
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-50">
                  <div><p className="text-xs text-brown/40">Role</p><RoleBadge role={u.role} /></div>
                  <div><p className="text-xs text-brown/40">Status</p><StatusBadge active={u.is_active} /></div>
                  <div><p className="text-xs text-brown/40">Joined</p><p className="text-sm font-semibold text-brown">{formatDate(u.created_at)}</p></div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <div className="rounded-2xl border border-whitewash-off overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-whitewash-off">
                    {['Customer', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-brown/40 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} className={cn('border-b border-whitewash-off last:border-0', i % 2 === 0 ? 'bg-white' : 'bg-whitewash/40')}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {u.avatar_url
                            ? <img src={u.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                            : <div className="w-9 h-9 rounded-full bg-peach flex items-center justify-center text-brown font-bold text-sm shrink-0">{(u.full_name ?? u.email)[0].toUpperCase()}</div>}
                          <div>
                            <p className="font-semibold text-brown">{u.full_name ?? 'No name'}</p>
                            <p className="text-xs text-brown/40">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                      <td className="px-5 py-4"><StatusBadge active={u.is_active} /></td>
                      <td className="px-5 py-4 text-brown/60">{formatDate(u.created_at)}</td>
                      <td className="px-5 py-4"><EditBtn onClick={() => setEditUser(u)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 text-sm text-brown/50">
                <span>Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-white border border-whitewash-off disabled:opacity-30 transition">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg> Previous
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-white border border-whitewash-off disabled:opacity-30 transition">
                    Next <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(undefined)} onSaved={load} />}
    </div>
  )
}
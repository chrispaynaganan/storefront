'use client'

import { useEffect, useState } from 'react'
import { formatDate, cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

interface EmployeeProfile {
  id: string
  user_id: string
  employee_id: string
  employment_type: 'full_time' | 'part_time'
  position: string | null
  department: string | null
  date_hired: string | null
  daily_rate: number | null
  work_days: string[]
  work_start: string | null
  work_end: string | null
  phone: string | null
  address: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  notes: string | null
}

interface User {
  id: string
  email: string
  full_name: string | null
  first_name: string | null
  last_name: string | null
  role: string
  is_active: boolean
  avatar_url: string | null
  created_at: string
  employee_profile?: EmployeeProfile | null
}

// ── Constants ─────────────────────────────────────────────────────────────────

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const ROLE_COLORS: Record<string, string> = {
  admin:    'bg-brown/10 text-brown',
  manager:  'bg-amber-100 text-amber-700',
  staff:    'bg-sky-100 text-sky-700',
  customer: 'bg-gray-100 text-gray-500',
}

// ── Small shared components ───────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize', ROLE_COLORS[role] ?? 'bg-gray-100 text-gray-500')}>
      {role}
    </span>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', active ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500')}>
      {active ? 'Active' : 'Suspended'}
    </span>
  )
}

function Avatar({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'lg' ? 'w-14 h-14 text-xl' : size === 'sm' ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-base'
  const letter = (user.full_name ?? user.email)[0].toUpperCase()
  return user.avatar_url
    ? <img src={user.avatar_url} alt="" className={cn(sz, 'rounded-full object-cover shrink-0')} />
    : <div className={cn(sz, 'rounded-full bg-peach flex items-center justify-center text-brown font-bold shrink-0')}>{letter}</div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-brown/50 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-brown outline-none focus:ring-2 focus:ring-peach transition border border-transparent focus:border-peach/30" />
}

function SelectInput({ ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className="w-full appearance-none bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-brown outline-none focus:ring-2 focus:ring-peach transition pr-8 border border-transparent focus:border-peach/30" />
      <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold text-brown/40 uppercase tracking-widest pt-2">{children}</p>
}

function SaveButton({ saving, label = 'Save Changes' }: { saving: boolean; label?: string }) {
  return (
    <button type="button" disabled={saving} className="w-full bg-brown text-whitewash font-semibold rounded-2xl py-3.5 flex items-center justify-center gap-2 hover:bg-brown-light transition disabled:opacity-50">
      {saving && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>}
      {label}
    </button>
  )
}

function ModalShell({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[92dvh]">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-brown">{title}</h2>
            {subtitle && <p className="text-xs text-brown/40 mt-0.5 truncate max-w-xs">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
            <svg className="w-5 h-5 text-brown/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-5">
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Work days picker ──────────────────────────────────────────────────────────

function WorkDaysPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  function toggle(day: string) {
    onChange(value.includes(day) ? value.filter(d => d !== day) : [...value, day])
  }
  return (
    <div className="flex gap-1.5 flex-wrap">
      {WEEK_DAYS.map(day => (
        <button
          key={day}
          type="button"
          onClick={() => toggle(day)}
          className={cn(
            'w-10 h-10 rounded-xl text-xs font-semibold transition',
            value.includes(day)
              ? 'bg-brown text-whitewash'
              : 'bg-gray-100 text-brown/50 hover:bg-gray-200'
          )}
        >
          {day}
        </button>
      ))}
    </div>
  )
}

// ── Employee profile form fields (shared between create + edit) ───────────────

interface ProfileFormProps {
  values: Partial<EmployeeProfile>
  onChange: (patch: Partial<EmployeeProfile>) => void
  showRole?: boolean
  role?: string
  onRoleChange?: (r: string) => void
  currentUserRole: string
}

function ProfileForm({ values, onChange, showRole, role, onRoleChange, currentUserRole }: ProfileFormProps) {
  const set = (patch: Partial<EmployeeProfile>) => onChange(patch)

  return (
    <>
      {showRole && currentUserRole === 'admin' && (
        <>
          <SectionHeading>Role & Access</SectionHeading>
          <Field label="Role">
            <SelectInput value={role ?? 'staff'} onChange={e => onRoleChange?.(e.target.value)}>
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </SelectInput>
          </Field>
        </>
      )}

      <SectionHeading>Employment</SectionHeading>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Position">
          <TextInput placeholder="e.g. Sales Associate" value={values.position ?? ''} onChange={e => set({ position: e.target.value })} />
        </Field>
        <Field label="Department">
          <TextInput placeholder="e.g. Operations" value={values.department ?? ''} onChange={e => set({ department: e.target.value })} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Employment Type">
          <SelectInput value={values.employment_type ?? 'full_time'} onChange={e => set({ employment_type: e.target.value as any })}>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
          </SelectInput>
        </Field>
        <Field label="Date Hired">
          <TextInput type="date" value={values.date_hired ?? ''} onChange={e => set({ date_hired: e.target.value })} />
        </Field>
      </div>
      <Field label="Daily Rate (₱)">
        <TextInput type="number" min="0" step="0.01" placeholder="0.00" value={values.daily_rate ?? ''} onChange={e => set({ daily_rate: parseFloat(e.target.value) || null as any })} />
      </Field>

      <SectionHeading>Work Schedule</SectionHeading>
      <Field label="Work Days">
        <WorkDaysPicker value={values.work_days ?? []} onChange={v => set({ work_days: v })} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Start Time">
          <TextInput type="time" value={values.work_start ?? ''} onChange={e => set({ work_start: e.target.value })} />
        </Field>
        <Field label="End Time">
          <TextInput type="time" value={values.work_end ?? ''} onChange={e => set({ work_end: e.target.value })} />
        </Field>
      </div>

      <SectionHeading>Contact Info</SectionHeading>
      <Field label="Phone">
        <TextInput type="tel" placeholder="+63 9XX XXX XXXX" value={values.phone ?? ''} onChange={e => set({ phone: e.target.value })} />
      </Field>
      <Field label="Address">
        <TextInput placeholder="Full address" value={values.address ?? ''} onChange={e => set({ address: e.target.value })} />
      </Field>

      <SectionHeading>Emergency Contact</SectionHeading>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Name">
          <TextInput placeholder="Contact name" value={values.emergency_contact_name ?? ''} onChange={e => set({ emergency_contact_name: e.target.value })} />
        </Field>
        <Field label="Phone">
          <TextInput type="tel" placeholder="+63 9XX XXX XXXX" value={values.emergency_contact_phone ?? ''} onChange={e => set({ emergency_contact_phone: e.target.value })} />
        </Field>
      </div>

      <SectionHeading>Notes</SectionHeading>
      <textarea
        rows={3}
        placeholder="Any additional notes about this team member…"
        value={values.notes ?? ''}
        onChange={e => set({ notes: e.target.value })}
        className="w-full bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-brown outline-none focus:ring-2 focus:ring-peach transition resize-none border border-transparent focus:border-peach/30"
      />
    </>
  )
}

// ── Create Team Member Modal ──────────────────────────────────────────────────

function CreateTeamModal({ onClose, onCreated, currentUserRole }: { onClose: () => void; onCreated: () => void; currentUserRole: string }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [role, setRole] = useState('staff')
  const [basic, setBasic] = useState({ email: '', password: '', first_name: '', last_name: '' })
  const [profile, setProfile] = useState<Partial<EmployeeProfile>>({ employment_type: 'full_time', work_days: [] })

  async function handleCreate() {
    if (!basic.email || !basic.password) { setError('Email and password are required'); return }
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...basic,
        full_name: `${basic.first_name} ${basic.last_name}`.trim() || undefined,
        role,
        ...profile,
      }),
    })
    const json = await res.json()
    setSaving(false)
    if (!res.ok) { setError(json.error ?? 'Something went wrong'); return }
    onCreated()
    onClose()
  }

  return (
    <ModalShell title="Add Team Member" onClose={onClose}>
      <SectionHeading>Account Info</SectionHeading>
      <div className="grid grid-cols-2 gap-4">
        <Field label="First Name">
          <TextInput placeholder="Juan" value={basic.first_name} onChange={e => setBasic(b => ({ ...b, first_name: e.target.value }))} />
        </Field>
        <Field label="Last Name">
          <TextInput placeholder="dela Cruz" value={basic.last_name} onChange={e => setBasic(b => ({ ...b, last_name: e.target.value }))} />
        </Field>
      </div>
      <Field label="Email">
        <TextInput type="email" placeholder="juan@knownandworn.com" value={basic.email} onChange={e => setBasic(b => ({ ...b, email: e.target.value }))} />
      </Field>
      <Field label="Temporary Password">
        <TextInput type="password" placeholder="They can change this after login" value={basic.password} onChange={e => setBasic(b => ({ ...b, password: e.target.value }))} />
      </Field>

      <ProfileForm
        values={profile}
        onChange={patch => setProfile(p => ({ ...p, ...patch }))}
        showRole
        role={role}
        onRoleChange={setRole}
        currentUserRole={currentUserRole}
      />

      {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>}
      <SaveButton saving={saving} label="Create Team Member" />
    </ModalShell>
  )
}

// ── Edit Customer Modal ───────────────────────────────────────────────────────

function EditCustomerModal({ user, currentUserRole, onClose, onSaved }: { user: User; currentUserRole: string; onClose: () => void; onSaved: () => void }) {
  const [role, setRole] = useState(user.role)
  const [isActive, setIsActive] = useState(user.is_active)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, is_active: isActive }),
    })
    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <ModalShell title="Edit Customer" subtitle={user.email} onClose={onClose}>
      <div className="flex items-center gap-3 bg-whitewash rounded-2xl p-4">
        <Avatar user={user} size="lg" />
        <div className="min-w-0">
          <p className="font-semibold text-brown truncate">{user.full_name ?? 'No name'}</p>
          <p className="text-xs text-brown/40 truncate">{user.email}</p>
          <p className="text-xs text-brown/30 mt-0.5">Joined {formatDate(user.created_at)}</p>
        </div>
      </div>

      {currentUserRole === 'admin' && (
        <Field label="Role">
          <SelectInput value={role} onChange={e => setRole(e.target.value)}>
            <option value="customer">Customer</option>
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </SelectInput>
        </Field>
      )}

      <label className="flex items-center gap-3 cursor-pointer bg-gray-50 rounded-2xl px-4 py-3">
        <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="accent-brown w-4 h-4" />
        <div>
          <p className="text-sm font-semibold text-brown">Account active</p>
          <p className="text-xs text-brown/40">Uncheck to suspend this customer's account</p>
        </div>
      </label>

      <SaveButton saving={saving} />
    </ModalShell>
  )
}

// ── Edit Team Member Modal ────────────────────────────────────────────────────

function EditTeamModal({ user, currentUserRole, onClose, onSaved }: { user: User; currentUserRole: string; onClose: () => void; onSaved: () => void }) {
  const ep = user.employee_profile
  const [role, setRole] = useState(user.role)
  const [isActive, setIsActive] = useState(user.is_active)
  const [profile, setProfile] = useState<Partial<EmployeeProfile>>({
    employment_type: ep?.employment_type ?? 'full_time',
    position: ep?.position ?? '',
    department: ep?.department ?? '',
    date_hired: ep?.date_hired ?? '',
    daily_rate: ep?.daily_rate ?? undefined,
    work_days: ep?.work_days ?? [],
    work_start: ep?.work_start ?? '',
    work_end: ep?.work_end ?? '',
    phone: ep?.phone ?? '',
    address: ep?.address ?? '',
    emergency_contact_name: ep?.emergency_contact_name ?? '',
    emergency_contact_phone: ep?.emergency_contact_phone ?? '',
    notes: ep?.notes ?? '',
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, is_active: isActive, ...profile }),
    })
    setSaving(false)
    onSaved()
    onClose()
  }

  return (
    <ModalShell title="Edit Team Member" subtitle={user.email} onClose={onClose}>
      {/* Header info */}
      <div className="flex items-center gap-3 bg-whitewash rounded-2xl p-4">
        <Avatar user={user} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-brown truncate">{user.full_name ?? 'No name'}</p>
          <p className="text-xs text-brown/40 truncate">{user.email}</p>
          {ep?.employee_id && (
            <p className="text-xs font-mono text-peach-dark mt-0.5">{ep.employee_id}</p>
          )}
        </div>
        <RoleBadge role={user.role} />
      </div>

      <label className="flex items-center gap-3 cursor-pointer bg-gray-50 rounded-2xl px-4 py-3">
        <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="accent-brown w-4 h-4" />
        <div>
          <p className="text-sm font-semibold text-brown">Account active</p>
          <p className="text-xs text-brown/40">Uncheck to suspend access</p>
        </div>
      </label>

      <ProfileForm
        values={profile}
        onChange={patch => setProfile(p => ({ ...p, ...patch }))}
        showRole
        role={role}
        onRoleChange={setRole}
        currentUserRole={currentUserRole}
      />

      <SaveButton saving={saving} />
    </ModalShell>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [tab, setTab] = useState<'customers' | 'team'>('customers')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [editUser, setEditUser] = useState<User | undefined>()
  const [showCreate, setShowCreate] = useState(false)
  const [currentUserRole, setCurrentUserRole] = useState('admin') // fetched on mount
  const PER_PAGE = 15

  // Fetch current user role on mount
  useEffect(() => {
    fetch('/api/admin/users/me')
      .then(r => r.json())
      .then(d => { if (d.role) setCurrentUserRole(d.role) })
      .catch(() => {})
  }, [])

  async function load() {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), search, tab })
    const res = await fetch(`/api/admin/users?${params}`)
    const json = await res.json()
    setUsers(json.data ?? [])
    setTotal(json.count ?? 0)
    setLoading(false)
  }

  useEffect(() => { load() }, [page, search, tab])

  // Reset page when tab or search changes
  useEffect(() => { setPage(1) }, [tab, search])

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="px-5 py-8 md:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-brown tracking-tight">Users</h1>
        {tab === 'team' && currentUserRole === 'admin' && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-brown text-whitewash text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-brown-light transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Team Member
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-whitewash-off rounded-2xl p-1 mb-6 w-fit">
        {(['customers', 'team'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-5 py-2 rounded-xl text-sm font-semibold transition capitalize',
              tab === t ? 'bg-white text-brown shadow-sm' : 'text-brown/50 hover:text-brown'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search — customers tab always, team tab always */}
      <div className="relative mb-6 max-w-sm">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input
          type="search"
          placeholder={tab === 'team' ? 'Search team by name or email…' : 'Search customers by name or email…'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-whitewash-off rounded-2xl pl-10 pr-4 py-3 text-sm text-brown placeholder:text-brown/30 outline-none focus:ring-2 focus:ring-peach transition"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />)}</div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 text-brown/40 text-sm">
          {tab === 'team' ? 'No team members yet.' : 'No customers found.'}
        </div>
      ) : tab === 'customers' ? (
        <CustomersTable
          users={users}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onEdit={setEditUser}
        />
      ) : (
        <TeamTable
          users={users}
          onEdit={setEditUser}
        />
      )}

      {/* Modals */}
      {editUser && tab === 'customers' && (
        <EditCustomerModal
          user={editUser}
          currentUserRole={currentUserRole}
          onClose={() => setEditUser(undefined)}
          onSaved={load}
        />
      )}
      {editUser && tab === 'team' && (
        <EditTeamModal
          user={editUser}
          currentUserRole={currentUserRole}
          onClose={() => setEditUser(undefined)}
          onSaved={load}
        />
      )}
      {showCreate && (
        <CreateTeamModal
          currentUserRole={currentUserRole}
          onClose={() => setShowCreate(false)}
          onCreated={load}
        />
      )}
    </div>
  )
}

// ── Customers table ───────────────────────────────────────────────────────────

function CustomersTable({ users, page, totalPages, onPageChange, onEdit }: {
  users: User[]
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  onEdit: (u: User) => void
}) {
  return (
    <>
      {/* Mobile */}
      <div className="md:hidden flex flex-col gap-3">
        {users.map(u => (
          <div key={u.id} className="bg-white rounded-2xl border border-whitewash-off p-4 flex items-center gap-3">
            <Avatar user={u} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-brown truncate">{u.full_name ?? 'No name'}</p>
              <p className="text-xs text-brown/40 truncate">{u.email}</p>
              <div className="flex gap-2 mt-1">
                <RoleBadge role={u.role} />
                <StatusBadge active={u.is_active} />
              </div>
            </div>
            <EditIconBtn onClick={() => onEdit(u)} />
          </div>
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden md:block rounded-2xl border border-whitewash-off overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-whitewash-off bg-whitewash/60">
              {['Customer', 'Role', 'Status', 'Joined', ''].map((h, i) => (
                <th key={i} className="px-5 py-3.5 text-left text-xs font-semibold text-brown/40 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} className={cn('border-b border-whitewash-off last:border-0', i % 2 === 0 ? 'bg-white' : 'bg-whitewash/30')}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar user={u} size="sm" />
                    <div>
                      <p className="font-semibold text-brown">{u.full_name ?? 'No name'}</p>
                      <p className="text-xs text-brown/40">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                <td className="px-5 py-4"><StatusBadge active={u.is_active} /></td>
                <td className="px-5 py-4 text-brown/50 text-sm">{formatDate(u.created_at)}</td>
                <td className="px-5 py-4"><EditIconBtn onClick={() => onEdit(u)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-brown/50">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-white border border-whitewash-off disabled:opacity-30 transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg> Prev
            </button>
            <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-white border border-whitewash-off disabled:opacity-30 transition">
              Next <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// ── Team table ────────────────────────────────────────────────────────────────

function TeamTable({ users, onEdit }: { users: User[]; onEdit: (u: User) => void }) {
  return (
    <>
      {/* Mobile */}
      <div className="md:hidden flex flex-col gap-3">
        {users.map(u => {
          const ep = u.employee_profile
          return (
            <div key={u.id} className="bg-white rounded-2xl border border-whitewash-off p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar user={u} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brown truncate">{u.full_name ?? 'No name'}</p>
                  <p className="text-xs text-brown/40 truncate">{u.email}</p>
                  {ep?.employee_id && <p className="text-xs font-mono text-peach-dark">{ep.employee_id}</p>}
                </div>
                <EditIconBtn onClick={() => onEdit(u)} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs border-t border-gray-50 pt-3">
                <div><span className="text-brown/40">Role</span><div className="mt-0.5"><RoleBadge role={u.role} /></div></div>
                <div><span className="text-brown/40">Status</span><div className="mt-0.5"><StatusBadge active={u.is_active} /></div></div>
                <div><span className="text-brown/40">Position</span><p className="text-brown font-medium mt-0.5">{ep?.position ?? '—'}</p></div>
                <div><span className="text-brown/40">Type</span><p className="text-brown font-medium mt-0.5 capitalize">{ep?.employment_type?.replace('_', ' ') ?? '—'}</p></div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop */}
      <div className="hidden md:block rounded-2xl border border-whitewash-off overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-whitewash-off bg-whitewash/60">
              {['Team Member', 'Employee ID', 'Role', 'Position', 'Type', 'Status', ''].map((h, i) => (
                <th key={i} className="px-5 py-3.5 text-left text-xs font-semibold text-brown/40 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const ep = u.employee_profile
              return (
                <tr key={u.id} className={cn('border-b border-whitewash-off last:border-0', i % 2 === 0 ? 'bg-white' : 'bg-whitewash/30')}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar user={u} size="sm" />
                      <div>
                        <p className="font-semibold text-brown">{u.full_name ?? 'No name'}</p>
                        <p className="text-xs text-brown/40">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-peach-dark">{ep?.employee_id ?? '—'}</span>
                  </td>
                  <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                  <td className="px-5 py-4 text-brown/70">{ep?.position ?? '—'}</td>
                  <td className="px-5 py-4 text-brown/70 capitalize">{ep?.employment_type?.replace('_', ' ') ?? '—'}</td>
                  <td className="px-5 py-4"><StatusBadge active={u.is_active} /></td>
                  <td className="px-5 py-4"><EditIconBtn onClick={() => onEdit(u)} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

// ── Edit icon button ──────────────────────────────────────────────────────────

function EditIconBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-brown/40 hover:text-brown">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
    </button>
  )
}
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { UserActions } from '@/components/admin/UserActions'

export const metadata = { title: 'Customers — Admin' }

export default async function AdminUsersPage() {
  const supabase = await createAdminSupabaseClient()
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-light text-brown">Customers</h1>
        <p className="text-sm text-brown-light mt-1">{users?.length ?? 0} total</p>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {users?.map(user => (
          <div key={user.id} className="bg-white rounded-xl border border-peach-light p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-brown text-sm">{user.full_name || '—'}</p>
                <p className="text-xs text-brown-light mt-0.5">{user.email}</p>
              </div>
              <Badge variant={user.role === 'admin' ? 'brown' : 'peach'}>{user.role}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={user.is_active ? 'success' : 'danger'}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <span className="text-xs text-brown-light">{formatDate(user.created_at)}</span>
              </div>
              <UserActions userId={user.id} isActive={user.is_active} role={user.role} />
            </div>
          </div>
        ))}
        {(!users || users.length === 0) && (
          <div className="py-16 text-center text-sm text-brown-light">No customers yet.</div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl border border-peach-light overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-whitewash border-b border-peach-light">
            <tr>
              {['Name', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left text-xs text-brown-light font-medium px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-peach-light">
            {users?.map(user => (
              <tr key={user.id} className="hover:bg-whitewash transition-colors">
                <td className="px-5 py-4 font-medium text-brown">{user.full_name || '—'}</td>
                <td className="px-5 py-4 text-brown-light">{user.email}</td>
                <td className="px-5 py-4">
                  <Badge variant={user.role === 'admin' ? 'brown' : 'peach'}>{user.role}</Badge>
                </td>
                <td className="px-5 py-4 text-brown-light">{formatDate(user.created_at)}</td>
                <td className="px-5 py-4">
                  <Badge variant={user.is_active ? 'success' : 'danger'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <UserActions userId={user.id} isActive={user.is_active} role={user.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!users || users.length === 0) && (
          <div className="py-16 text-center text-sm text-brown-light">No customers yet.</div>
        )}
      </div>
    </div>
  )
}
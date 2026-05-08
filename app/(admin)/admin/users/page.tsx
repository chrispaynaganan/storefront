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
      <div className="mb-8">
        <h1 className="text-2xl font-light text-[#3B1F0E]">Customers</h1>
        <p className="text-sm text-[#6B3A22] mt-1">{users?.length ?? 0} total</p>
      </div>

      <div className="bg-white rounded-xl border border-[#FFE8D6] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAF7F4] border-b border-[#FFE8D6]">
            <tr>
              {['Name', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left text-xs text-[#6B3A22] font-medium px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#FFE8D6]">
            {users?.map(user => (
              <tr key={user.id} className="hover:bg-[#FAF7F4] transition-colors">
                <td className="px-5 py-4 font-medium text-[#3B1F0E]">{user.full_name || '—'}</td>
                <td className="px-5 py-4 text-[#6B3A22]">{user.email}</td>
                <td className="px-5 py-4">
                  <Badge variant={user.role === 'admin' ? 'brown' : 'peach'}>{user.role}</Badge>
                </td>
                <td className="px-5 py-4 text-[#6B3A22]">{formatDate(user.created_at)}</td>
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
          <div className="py-16 text-center text-sm text-[#6B3A22]">No customers yet.</div>
        )}
      </div>
    </div>
  )
}
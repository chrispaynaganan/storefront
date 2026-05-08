import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { EmptyState } from '@/components/ui/EmptyState'
import type { User } from '@/types'

export function UserTable({ users }: { users: User[] }) {
  if (users.length === 0) return <EmptyState message="No customers yet." />
  return (
    <div className="bg-white rounded-xl border border-peach-light overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-whitewash-off border-b border-peach-light">
          <tr>
            {['Name', 'Email', 'Role', 'Joined', 'Status'].map(h => (
              <th key={h} className="text-left text-xs text-brown-light font-medium px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-peach-light">
          {users.map(u => (
            <tr key={u.id} className="hover:bg-whitewash">
              <td className="px-4 py-3 text-brown">{u.full_name ?? '—'}</td>
              <td className="px-4 py-3 text-brown-light">{u.email}</td>
              <td className="px-4 py-3"><Badge variant={u.role === 'admin' ? 'brown' : 'peach'}>{u.role}</Badge></td>
              <td className="px-4 py-3 text-brown-light">{formatDate(u.created_at)}</td>
              <td className="px-4 py-3"><Badge variant={u.is_active ? 'success' : 'danger'}>{u.is_active ? 'Active' : 'Inactive'}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

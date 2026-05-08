import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user || user.role !== 'admin') redirect('/login')
  return (
    <div className="flex min-h-screen bg-whitewash-off">
      <AdminSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}

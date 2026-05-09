import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user || user.role !== 'admin') redirect('/login')
  return (
    <div className="flex min-h-screen w-full bg-[#FAF7F4]">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-4 md:p-8 pb-28 md:pb-8">{children}</main>
    </div>
  )
}
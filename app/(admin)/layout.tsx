// app/(admin)/admin/layout.tsx

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import AdminNav from '@/components/layout/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role, avatar_url, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  const firstName = profile?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'Admin'

  return (
    <div className="min-h-screen bg-whitewash">
      <AdminNav
        userEmail={user.email}
        avatarUrl={profile?.avatar_url}
        firstName={firstName}
        userRole={profile?.role ?? 'admin'}
      />

      {/* Main content: offset for sidebar on lg+, offset for top navbar on md */}
      <div className="lg:pl-78">
        <main className="min-w-0 pb-28 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}
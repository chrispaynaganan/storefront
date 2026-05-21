import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { AdminSidebar } from '@/components/layout/AdminSidebar'

const ALLOWED_ROLES = ['admin', 'manager', 'staff']

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('role, avatar_url, full_name, first_name')
    .eq('id', user.id)
    .single()

  if (!profile || !ALLOWED_ROLES.includes(profile.role)) redirect('/')

  const firstName = profile?.first_name ?? profile?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'Admin'

  return (
    <div className="min-h-screen bg-whitewash">
      <AdminSidebar
        userEmail={user.email}
        avatarUrl={profile?.avatar_url}
        firstName={firstName}
        userRole={profile?.role ?? 'staff'}
      />

      <div className="pl-55">
        <main className="min-w-0 pb-28 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}
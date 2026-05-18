import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getPage } from '@/lib/cms'
import { PageEditorClient } from './PageEditorClient'

async function requireAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase
    .from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/admin')
}

export default async function PageEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const page = await getPage(id)
  if (!page) notFound()
  return <PageEditorClient page={page} />
}
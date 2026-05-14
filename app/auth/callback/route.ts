import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { logActivity } from '@/lib/activity-log'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      await supabase.from('users').upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? null,
        avatar_url: data.user.user_metadata?.avatar_url ?? data.user.user_metadata?.picture ?? null,
        role: 'customer',
        is_active: true,
      }, { onConflict: 'id', ignoreDuplicates: false })

      const { data: profile } = await supabase
        .from('users')
        .select('role, full_name')
        .eq('id', data.user.id)
        .single()

      await logActivity({
        userId: data.user.id,
        userName: profile?.full_name ?? data.user.email ?? null,
        userRole: profile?.role ?? 'customer',
        action: 'signed_in',
        entity: 'auth',
        entityId: data.user.id,
        entityName: profile?.full_name ?? data.user.email ?? null,
        metadata: { method: 'oauth', provider: data.user.app_metadata?.provider ?? 'unknown' },
      })

      const destination = profile?.role === 'admin' ? '/admin' : next
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`)
}
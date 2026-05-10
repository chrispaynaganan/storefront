// app/auth/callback/route.ts
// Supabase redirects here after Google / Facebook OAuth.
// Exchanges the code for a session, upserts the user profile, then redirects.

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Upsert into users table — social logins won't have triggered the
      // email signup path, so we ensure the row exists here.
      await supabase.from('users').upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name ?? data.user.user_metadata?.name ?? null,
        avatar_url: data.user.user_metadata?.avatar_url ?? data.user.user_metadata?.picture ?? null,
        role: 'customer',
        is_active: true,
      }, { onConflict: 'id', ignoreDuplicates: false })

      // Redirect admins to /admin, everyone else to wherever they came from
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      const destination = profile?.role === 'admin' ? '/admin' : next
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  // Something went wrong — send back to login with an error flag
  return NextResponse.redirect(`${origin}/login?error=oauth`)
}
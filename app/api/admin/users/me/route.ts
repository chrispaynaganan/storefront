import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('users')
      .select('role, full_name, first_name, avatar_url')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: profile?.role ?? 'staff',
      full_name: profile?.full_name,
      first_name: profile?.first_name,
      avatar_url: profile?.avatar_url,
    })
  } catch (err) {
    console.error('GET /me error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
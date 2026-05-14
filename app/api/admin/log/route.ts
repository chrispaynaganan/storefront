import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    // Verify the requester is an admin
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const adminSupabase = await createAdminSupabaseClient()

    await adminSupabase.from('activity_logs').insert({
      user_id: body.userId ?? null,
      user_name: body.userName ?? null,
      user_role: body.userRole ?? null,
      action: body.action,
      entity: body.entity,
      entity_id: body.entityId ?? null,
      entity_name: body.entityName ?? null,
      changes: body.changes ?? null,
      metadata: body.metadata ?? null,
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
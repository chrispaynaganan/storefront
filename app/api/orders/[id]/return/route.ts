import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'
import { logActivity } from '@/lib/activity-log'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const reason: string = body.reason ?? ''

    if (!reason.trim()) {
      return NextResponse.json({ error: 'Please provide a reason for the return' }, { status: 400 })
    }

    const adminSupabase = await createAdminSupabaseClient()

    const { data: order } = await adminSupabase
      .from('orders')
      .select('id, user_id, status, total')
      .eq('id', params.id)
      .single()

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    if (order.status !== 'delivered') {
      return NextResponse.json(
        { error: 'Only delivered orders can be returned' },
        { status: 400 }
      )
    }

    const { error } = await adminSupabase
      .from('orders')
      .update({
        status: 'return_requested',
        return_reason: reason,
        return_requested_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    if (error) return NextResponse.json({ error: 'Failed to submit return request' }, { status: 500 })

    await logActivity({
      userId: user.id,
      action: 'return_requested',
      entity: 'orders',
      entityId: params.id,
      entityName: `Order #${params.id.slice(0, 8)}`,
      metadata: { reason, total: order.total },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Return order error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
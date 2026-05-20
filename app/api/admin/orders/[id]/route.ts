import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'
import { logActivity } from '@/lib/activity-log'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('users')
      .select('role, full_name, first_name')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'staff', 'manager'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { status, courier, tracking_number, delivered_at } = body

    const adminSupabase = await createAdminSupabaseClient()

    // Get current order for logging
    const { data: current } = await adminSupabase
      .from('orders')
      .select('status, courier, tracking_number')
      .eq('id', params.id)
      .single()

    if (!current) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const updates: Record<string, any> = {}
    if (status !== undefined) updates.status = status
    if (courier !== undefined) updates.courier = courier
    if (tracking_number !== undefined) updates.tracking_number = tracking_number
    if (status === 'delivered') updates.delivered_at = delivered_at ?? new Date().toISOString()

    const { error } = await adminSupabase
      .from('orders')
      .update(updates)
      .eq('id', params.id)

    if (error) {
      console.error('Order update error:', error)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    const userName = profile.first_name ?? profile.full_name ?? user.email
    await logActivity({
      userId: user.id,
      userName,
      userRole: profile.role,
      action: 'order_updated',
      entity: 'orders',
      entityId: params.id,
      entityName: `Order #${params.id.slice(0, 8)}`,
      changes: Object.fromEntries(
        Object.keys(updates).map((key) => [
          key,
          { from: (current as any)[key] ?? null, to: updates[key] ?? null },
        ])
      ),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PATCH order error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
// app/api/admin/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'
import { logActivity } from '@/lib/activity-log'
import { sendOrderStatusEmail } from '@/lib/email/order-status'

const STATUS_EMAIL_TRIGGERS = new Set([
  'packed', 'shipped', 'out_for_delivery', 'delivered',
  'cancelled', 'return_requested', 'refunded',
])

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    const { data: current } = await adminSupabase
      .from('orders')
      .select('status, courier, tracking_number, user_id, total')
      .eq('id', id)
      .single()

    if (!current) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const updates: Record<string, any> = {}
    if (status !== undefined) updates.status = status
    if (courier !== undefined) updates.courier = courier
    if (tracking_number !== undefined) updates.tracking_number = tracking_number
    if (status === 'delivered') updates.delivered_at = delivered_at ?? new Date().toISOString()

    const { error } = await adminSupabase.from('orders').update(updates).eq('id', id)
    if (error) return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })

    const userName = profile.first_name ?? profile.full_name ?? user.email
    await logActivity({
      userId: user.id,
      userName,
      userRole: profile.role,
      action: 'order_updated',
      entity: 'orders',
      entityId: id,
      entityName: `Order #${id.slice(0, 8)}`,
      changes: Object.fromEntries(
        Object.keys(updates).map((key) => [
          key,
          { from: (current as any)[key] ?? null, to: updates[key] ?? null },
        ])
      ),
    })

    // Send status-change email to customer
    if (status && STATUS_EMAIL_TRIGGERS.has(status) && status !== current.status) {
      const { data: customer } = await adminSupabase
        .from('users')
        .select('email, first_name, full_name')
        .eq('id', current.user_id)
        .single()

      if (customer) {
        await sendOrderStatusEmail(status, {
          order_id: id,
          customer_name: customer.first_name ?? customer.full_name ?? 'there',
          customer_email: customer.email,
          total: current.total,
          courier: updates.courier ?? current.courier,
          tracking_number: updates.tracking_number ?? current.tracking_number,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PATCH order error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
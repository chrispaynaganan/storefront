import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'
import { logActivity } from '@/lib/activity-log'

const CANCELLABLE_STATUSES = ['paid', 'packed']

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const reason: string = body.reason ?? 'Cancelled by customer'

    const adminSupabase = await createAdminSupabaseClient()

    const { data: order } = await adminSupabase
      .from('orders')
      .select('id, user_id, status, total, payment_method')
      .eq('id', params.id)
      .single()

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      return NextResponse.json(
        { error: `This order can no longer be cancelled. Current status: ${order.status}` },
        { status: 400 }
      )
    }

    const { error: cancelError } = await adminSupabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    if (cancelError) return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 })

    // Restore stock
    const { data: orderItems } = await adminSupabase
      .from('order_items')
      .select('variant_id, qty')
      .eq('order_id', params.id)

    if (orderItems) {
      for (const item of orderItems) {
        const { data: variant } = await adminSupabase
          .from('variants')
          .select('stock_qty')
          .eq('id', item.variant_id)
          .single()
        if (variant) {
          await adminSupabase
            .from('variants')
            .update({ stock_qty: variant.stock_qty + item.qty })
            .eq('id', item.variant_id)
        }
      }
    }

    await logActivity({
      userId: user.id,
      action: 'order_cancelled',
      entity: 'orders',
      entityId: params.id,
      entityName: `Order #${params.id.slice(0, 8)}`,
      metadata: { reason, total: order.total, payment_method: order.payment_method },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Cancel order error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
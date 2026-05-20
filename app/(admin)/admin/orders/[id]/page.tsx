import { notFound } from 'next/navigation'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'
import AdminOrderDetail from '@/components/admin/AdminOrderDetail'

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const adminSupabase = await createAdminSupabaseClient()

  const { data: order } = await adminSupabase
    .from('orders')
    .select(`
      id,
      status,
      subtotal,
      discount,
      total,
      currency,
      payment_method,
      paypal_order_id,
      paymongo_payment_id,
      paymongo_source_id,
      courier,
      tracking_number,
      cancellation_reason,
      cancelled_at,
      delivered_at,
      return_reason,
      return_requested_at,
      created_at,
      user:users(id, full_name, first_name, last_name, email),
      address:addresses(line1, line2, city, province, postal_code, country),
      order_items(
        id,
        qty,
        unit_price,
        line_total,
        variant:variants(
          id,
          size,
          color,
          color_hex,
          sku,
          product:products(id, name, slug, image_urls)
        )
      )
    `)
    .eq('id', params.id)
    .single()

  if (!order) notFound()

  return <AdminOrderDetail order={order as any} />
}
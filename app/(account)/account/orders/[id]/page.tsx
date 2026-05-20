import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'
import CustomerOrderDetail from '@/components/account/CustomerOrderDetail'

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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
      courier,
      tracking_number,
      cancellation_reason,
      cancelled_at,
      delivered_at,
      return_reason,
      return_requested_at,
      created_at,
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
          product:products(id, name, slug, image_urls)
        )
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!order) notFound()

  return <CustomerOrderDetail order={order as any} />
}
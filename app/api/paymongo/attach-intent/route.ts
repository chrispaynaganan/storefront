import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'
import { logActivity } from '@/lib/activity-log'
import { sendOrderConfirmationEmail } from '@/lib/email/order-confirmation'
import { sendAdminNewOrderEmail } from '@/lib/email/order-status'

const PAYMONGO_SECRET = process.env.PAYMONGO_SECRET_KEY!
const PAYMONGO_BASE = 'https://api.paymongo.com/v1'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!

function paymongoHeaders() {
  const encoded = Buffer.from(`${PAYMONGO_SECRET}:`).toString('base64')
  return {
    'Content-Type': 'application/json',
    Authorization: `Basic ${encoded}`,
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { intent_id, payment_method_id } = body as {
      intent_id: string
      payment_method_id: string
    }

    if (!intent_id || !payment_method_id) {
      return NextResponse.json({ error: 'Missing intent_id or payment_method_id' }, { status: 400 })
    }

    const returnUrl = `${SITE_URL}/checkout/return?status=success&type=card`

    // Attach payment method to intent
    const attachRes = await fetch(
      `${PAYMONGO_BASE}/payment_intents/${intent_id}/attach`,
      {
        method: 'POST',
        headers: paymongoHeaders(),
        body: JSON.stringify({
          data: {
            attributes: {
              payment_method: payment_method_id,
              return_url: returnUrl,
            },
          },
        }),
      }
    )

    const attachJson = await attachRes.json()

    if (!attachRes.ok) {
      console.error('PayMongo attach error:', JSON.stringify(attachJson, null, 2))
      const errMsg = attachJson?.errors?.[0]?.detail ?? 'Failed to process card payment'
      return NextResponse.json({ error: errMsg }, { status: 400 })
    }

    const status: string = attachJson.data.attributes.status
    const nextAction = attachJson.data.attributes.next_action

    // 3DS required — return redirect URL to client, order created by webhook later
    if (status === 'awaiting_next_action' && nextAction?.type === 'redirect') {
      return NextResponse.json({
        status: '3ds_required',
        redirect_url: nextAction.redirect.url,
      })
    }

    // Payment succeeded without 3DS — create order immediately
    if (status === 'succeeded') {
      const payments = attachJson.data.attributes.payments ?? []
      const paymongoPaymentId: string = payments[0]?.id ?? intent_id

      const adminSupabase = await createAdminSupabaseClient()

      // Get pending checkout
      const { data: pending, error: pendingError } = await adminSupabase
        .from('pending_paymongo_checkouts')
        .select('*')
        .eq('source_id', intent_id)
        .eq('status', 'pending')
        .single()

      if (pendingError || !pending) {
        console.error('Pending checkout not found for intent', intent_id)
        return NextResponse.json({ error: 'Pending checkout not found' }, { status: 404 })
      }

      // Mark processing
      await adminSupabase
        .from('pending_paymongo_checkouts')
        .update({ status: 'processing' })
        .eq('source_id', intent_id)

      // Fetch cart items
      const { data: cartItems, error: cartError } = await adminSupabase
        .from('cart_items')
        .select(`
          id,
          qty,
          variant_id,
          variant:variants(
            id,
            price,
            size,
            color,
            color_hex,
            product:products(
              name,
              image_urls
            )
          )
        `)
        .eq('user_id', pending.user_id)

      if (cartError || !cartItems || cartItems.length === 0) {
        throw new Error('Cart is empty')
      }

      // Decrement stock
      const stockItems = cartItems.map((ci: any) => ({
        variant_id: ci.variant_id,
        qty: ci.qty,
      }))

      const { data: stockResult, error: stockError } = await adminSupabase.rpc(
        'decrement_stock_for_items',
        { p_items: stockItems }
      )

      if (stockError || !stockResult?.success) {
        throw new Error('Stock decrement failed — insufficient stock')
      }

      // Save address
      const addr = pending.address
      const { data: savedAddress, error: addrError } = await adminSupabase
        .from('addresses')
        .insert({
          user_id: pending.user_id,
          line1: addr.line1,
          line2: addr.line2 ?? null,
          city: addr.city,
          province: addr.province,
          country: addr.country || 'PH',
          postal_code: addr.postal_code,
          is_default: false,
        })
        .select('id')
        .single()

      if (addrError || !savedAddress) {
        throw new Error('Failed to save address')
      }

      // Create order
      const { data: order, error: orderError } = await adminSupabase
        .from('orders')
        .insert({
          user_id: pending.user_id,
          address_id: savedAddress.id,
          status: 'paid',
          subtotal: pending.subtotal,
          discount: pending.discount,
          total: pending.total,
          currency: 'PHP',
          paypal_order_id: null,
          paymongo_payment_id: paymongoPaymentId,
          paymongo_source_id: intent_id,
          payment_method: 'card',
        })
        .select('id')
        .single()

      if (orderError || !order) {
        throw new Error(`Failed to create order: ${JSON.stringify(orderError)}`)
      }

      // Create order items
      const orderItems = cartItems.map((ci: any) => {
        const variant = ci.variant as any
        return {
          order_id: order.id,
          variant_id: ci.variant_id,
          qty: ci.qty,
          unit_price: variant.price,
          line_total: variant.price * ci.qty,
        }
      })

      await adminSupabase.from('order_items').insert(orderItems)
      await adminSupabase.from('cart_items').delete().eq('user_id', pending.user_id)

      // Mark completed
      await adminSupabase
        .from('pending_paymongo_checkouts')
        .update({ status: 'completed', order_id: order.id })
        .eq('source_id', intent_id)

      // Increment promo usage count
      if (pending.promo_code) {
        await adminSupabase.rpc('increment_promo_usage', {
          p_code: pending.promo_code.toUpperCase(),
        })
      }

      // Load user profile for emails
      const { data: userProfile } = await adminSupabase
        .from('users')
        .select('email, first_name, full_name')
        .eq('id', pending.user_id)
        .single()

      if (userProfile) {
        // Confirmation email to customer
        await sendOrderConfirmationEmail({
          order_id: order.id,
          customer_name: userProfile.first_name ?? userProfile.full_name ?? 'Customer',
          customer_email: userProfile.email,
          subtotal: pending.subtotal,
          discount: pending.discount,
          total: pending.total,
          currency: 'PHP',
          paypal_order_id: paymongoPaymentId,
          address: {
            line1: addr.line1,
            line2: addr.line2,
            city: addr.city,
            province: addr.province,
            postal_code: addr.postal_code,
            country: addr.country || 'PH',
          },
          items: cartItems.map((ci: any) => {
            const variant = ci.variant as any
            const imageUrls: string[] = variant?.product?.image_urls ?? []
            return {
              name: variant?.product?.name ?? 'Item',
              size: variant?.size ?? '',
              color: variant?.color ?? '',
              color_hex: variant?.color_hex ?? '#000000',
              qty: ci.qty,
              unit_price: variant?.price ?? 0,
              line_total: (variant?.price ?? 0) * ci.qty,
              image_url: imageUrls[0] ?? undefined,
            }
          }),
        })

        // Notification email to admin
        await sendAdminNewOrderEmail({
          order_id: order.id,
          customer_name: userProfile.first_name ?? userProfile.full_name ?? 'Customer',
          customer_email: userProfile.email,
          total: pending.total,
          payment_method: 'card',
          item_count: cartItems.length,
        })
      }

      await logActivity({
        userId: pending.user_id,
        action: 'order_placed',
        entity: 'orders',
        entityId: order.id,
        entityName: `Order #${order.id}`,
        metadata: { payment_method: 'card', total: pending.total },
      })

      console.log('✅ Card order created successfully:', order.id)
      return NextResponse.json({ status: 'succeeded', order_id: order.id })
    }

    // Payment failed
    return NextResponse.json({
      status: 'failed',
      error: attachJson.data.attributes.last_payment_error?.failed_message ?? 'Payment failed',
    })
  } catch (err: any) {
    console.error('PayMongo attach-intent error:', err.message)
    return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import { logActivity } from '@/lib/activity-log'
import { sendOrderConfirmationEmail } from '@/lib/email/order-confirmation'
import { sendAdminNewOrderEmail } from '@/lib/email/order-status'
import crypto from 'crypto'

function verifyPaymongoSignature(rawBody: string, sigHeader: string): boolean {
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET
  if (!secret) {
    console.error('PAYMONGO_WEBHOOK_SECRET is not set')
    return false
  }

  const parts: Record<string, string> = {}
  sigHeader.split(',').forEach((part) => {
    const eqIndex = part.indexOf('=')
    if (eqIndex > -1) {
      const k = part.slice(0, eqIndex).trim()
      const v = part.slice(eqIndex + 1).trim()
      parts[k] = v
    }
  })

  const timestamp = parts['t']
  const sig = parts['li'] ?? parts['te']

  console.log('Webhook secret prefix:', secret.slice(0, 8))
  console.log('Parsed sig prefix:', sig?.slice(0, 8), '| timestamp:', timestamp)

  if (!timestamp || !sig) {
    console.error('Missing timestamp or sig in header')
    return false
  }

  const signedPayload = `${timestamp}.${rawBody}`
  const expected = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex')

  console.log('Expected prefix:', expected.slice(0, 8), '| lengths:', expected.length, sig.length)

  if (expected.length !== sig.length) {
    console.error('Signature length mismatch')
    return false
  }

  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(sig, 'utf8'))
  } catch (err) {
    console.error('timingSafeEqual threw:', err)
    return false
  }
}

// ── Shared order creation logic ───────────────────────────────────────────────

async function processOrder(
  adminSupabase: any,
  sourceId: string,
  paymongoPaymentId: string
) {
  const { data: pending, error: pendingError } = await adminSupabase
    .from('pending_paymongo_checkouts')
    .select('*')
    .eq('source_id', sourceId)
    .eq('status', 'pending')
    .single()

  if (pendingError || !pending) {
    console.error('Pending checkout not found for source/intent', sourceId)
    return
  }

  // Idempotency guard
  await adminSupabase
    .from('pending_paymongo_checkouts')
    .update({ status: 'processing' })
    .eq('source_id', sourceId)

  try {
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
      throw new Error('Cart is empty at webhook time')
    }

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
        paymongo_source_id: sourceId,
        payment_method: pending.method,
      })
      .select('id')
      .single()

    if (orderError || !order) {
      throw new Error(`Failed to create order: ${JSON.stringify(orderError)}`)
    }

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

    await adminSupabase
      .from('pending_paymongo_checkouts')
      .update({ status: 'completed', order_id: order.id })
      .eq('source_id', sourceId)

    // Increment global usage count + record per-user usage
    if (pending.promo_code) {
      await adminSupabase.rpc('increment_promo_usage', {
        p_code: pending.promo_code.toUpperCase(),
      })

      const { data: promo } = await adminSupabase
        .from('promos')
        .select('id')
        .eq('code', pending.promo_code.toUpperCase())
        .single()

      if (promo) {
        await adminSupabase.from('promo_usages').insert({
          promo_id: promo.id,
          user_id: pending.user_id,
          order_id: order.id,
        })
      }
    }

    const { data: userProfile } = await adminSupabase
      .from('users')
      .select('email, first_name, full_name')
      .eq('id', pending.user_id)
      .single()

    if (userProfile) {
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

      await sendAdminNewOrderEmail({
        order_id: order.id,
        customer_name: userProfile.first_name ?? userProfile.full_name ?? 'Customer',
        customer_email: userProfile.email,
        total: pending.total,
        payment_method: pending.method,
        item_count: cartItems.length,
      })
    }

    await logActivity({
      userId: pending.user_id,
      action: 'order_placed',
      entity: 'orders',
      entityId: order.id,
      entityName: `Order #${order.id}`,
      metadata: { payment_method: pending.method, total: pending.total },
    })

    console.log('✅ Order created successfully:', order.id)
  } catch (err: any) {
    console.error('❌ Webhook processing error:', err.message)
    await adminSupabase
      .from('pending_paymongo_checkouts')
      .update({ status: 'failed', error: err.message })
      .eq('source_id', sourceId)
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sigHeader = req.headers.get('paymongo-signature') ?? ''

  console.log('=== PayMongo webhook hit ===')

  const SKIP_SIG = process.env.PAYMONGO_SKIP_SIG_CHECK === 'true'

  if (!SKIP_SIG && !verifyPaymongoSignature(rawBody, sigHeader)) {
    console.warn('PayMongo webhook: invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  if (SKIP_SIG) {
    console.warn('⚠️  Signature check SKIPPED — debug mode')
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType: string = event?.data?.attributes?.type ?? ''
  const eventData = event?.data?.attributes?.data

  console.log('Event type:', eventType)

  const adminSupabase = await createAdminSupabaseClient()

  // ── GCash / Maya: source.chargeable ──────────────────────────────────────
  if (eventType === 'source.chargeable') {
    const sourceId: string = eventData?.id
    if (!sourceId) {
      return NextResponse.json({ error: 'Missing source id' }, { status: 400 })
    }

    const { data: pending } = await adminSupabase
      .from('pending_paymongo_checkouts')
      .select('total')
      .eq('source_id', sourceId)
      .eq('status', 'pending')
      .single()

    if (!pending) {
      console.error('No pending checkout for source', sourceId)
      return NextResponse.json({ error: 'Pending checkout not found' }, { status: 404 })
    }

    const PAYMONGO_SECRET = process.env.PAYMONGO_SECRET_KEY!
    const encoded = Buffer.from(`${PAYMONGO_SECRET}:`).toString('base64')
    const pmHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Basic ${encoded}`,
    }

    const paymentRes = await fetch('https://api.paymongo.com/v1/payments', {
      method: 'POST',
      headers: pmHeaders,
      body: JSON.stringify({
        data: {
          attributes: {
            amount: Math.round(pending.total * 100),
            currency: 'PHP',
            source: { id: sourceId, type: 'source' },
            description: 'Known & Worn order',
          },
        },
      }),
    })

    if (!paymentRes.ok) {
      const err = await paymentRes.json()
      console.error('PayMongo payment creation failed:', JSON.stringify(err))
      return NextResponse.json({ received: true, error: 'Payment creation failed' })
    }

    const paymentData = await paymentRes.json()
    const paymongoPaymentId: string = paymentData.data.id
    const paymentStatus: string = paymentData.data.attributes.status

    if (paymentStatus !== 'paid') {
      console.error('Payment not paid, status:', paymentStatus)
      return NextResponse.json({ received: true })
    }

    await processOrder(adminSupabase, sourceId, paymongoPaymentId)
    return NextResponse.json({ received: true })
  }

  // ── Card: payment.paid ────────────────────────────────────────────────────
  if (eventType === 'payment.paid') {
    const paymongoPaymentId: string = eventData?.id
    const intentId: string = eventData?.attributes?.payment_intent_id

    if (!intentId) {
      console.error('payment.paid event missing payment_intent_id')
      return NextResponse.json({ error: 'Missing intent id' }, { status: 400 })
    }

    console.log('Card payment paid, intent:', intentId, 'payment:', paymongoPaymentId)
    await processOrder(adminSupabase, intentId, paymongoPaymentId)
    return NextResponse.json({ received: true })
  }

  return NextResponse.json({ received: true })
}
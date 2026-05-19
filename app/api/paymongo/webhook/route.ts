import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'
import { logActivity } from '@/lib/activity-log'
import { sendOrderConfirmationEmail } from '@/lib/email/order-confirmation'

const PAYMONGO_WEBHOOK_SECRET = process.env.PAYMONGO_WEBHOOK_SECRET!

function verifyPaymongoSignature(rawBody: string, sigHeader: string): boolean {
  const crypto = require('crypto')

  const parts: Record<string, string> = {}
  sigHeader.split(',').forEach((part) => {
    const [k, v] = part.split('=')
    parts[k.trim()] = v?.trim()
  })

  const timestamp = parts['t']
  const testSig = parts['te']
  const liveSig = parts['li']
  const sig = liveSig ?? testSig

  if (!timestamp || !sig) return false

  const signedPayload = `${timestamp}.${rawBody}`
  const expected = crypto
    .createHmac('sha256', PAYMONGO_WEBHOOK_SECRET)
    .update(signedPayload)
    .digest('hex')

  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(sig, 'hex'))
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sigHeader = req.headers.get('paymongo-signature') ?? ''

  if (!verifyPaymongoSignature(rawBody, sigHeader)) {
    console.warn('PayMongo webhook: invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType: string = event?.data?.attributes?.type ?? ''
  const eventData = event?.data?.attributes?.data

  if (eventType !== 'source.chargeable') {
    return NextResponse.json({ received: true })
  }

  const sourceId: string = eventData?.id
  if (!sourceId) {
    return NextResponse.json({ error: 'Missing source id' }, { status: 400 })
  }

  const adminSupabase = await createAdminSupabaseClient()

  const { data: pending, error: pendingError } = await adminSupabase
    .from('pending_paymongo_checkouts')
    .select('*')
    .eq('source_id', sourceId)
    .eq('status', 'pending')
    .single()

  if (pendingError || !pending) {
    console.error('PayMongo webhook: pending checkout not found for source', sourceId)
    return NextResponse.json({ error: 'Pending checkout not found' }, { status: 404 })
  }

  // Mark as processing immediately for idempotency
  await adminSupabase
    .from('pending_paymongo_checkouts')
    .update({ status: 'processing' })
    .eq('source_id', sourceId)

  try {
    // Fetch cart items
    const { data: cartItems, error: cartError } = await adminSupabase
      .from('cart_items')
      .select(
        `
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
      `
      )
      .eq('user_id', pending.user_id)

    if (cartError || !cartItems || cartItems.length === 0) {
      throw new Error('Cart is empty at webhook time')
    }

    // Create PayMongo Payment from chargeable source
    const PAYMONGO_SECRET = process.env.PAYMONGO_SECRET_KEY!
    const encoded = Buffer.from(`${PAYMONGO_SECRET}:`).toString('base64')
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Basic ${encoded}`,
    }

    const paymentRes = await fetch('https://api.paymongo.com/v1/payments', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: {
          attributes: {
            amount: Math.round(pending.total * 100),
            currency: 'PHP',
            source: { id: sourceId, type: 'source' },
            description: `Known & Worn order`,
          },
        },
      }),
    })

    if (!paymentRes.ok) {
      const err = await paymentRes.json()
      throw new Error(`PayMongo payment creation failed: ${JSON.stringify(err)}`)
    }

    const paymentData = await paymentRes.json()
    const paymongoPaymentId: string = paymentData.data.id
    const paymentStatus: string = paymentData.data.attributes.status

    if (paymentStatus !== 'paid') {
      throw new Error(`Payment status is ${paymentStatus}, expected paid`)
    }

    // Decrement stock atomically
    const stockItems = cartItems.map((ci) => ({
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
        paymongo_source_id: sourceId,
        payment_method: pending.method,
      })
      .select('id')
      .single()

    if (orderError || !order) {
      throw new Error('Failed to create order')
    }

    // Create order items
    const orderItems = cartItems.map((ci) => {
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

    // Clear cart
    await adminSupabase.from('cart_items').delete().eq('user_id', pending.user_id)

    // Mark pending checkout as completed
    await adminSupabase
      .from('pending_paymongo_checkouts')
      .update({ status: 'completed', order_id: order.id })
      .eq('source_id', sourceId)

    // Send confirmation email with full shape
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
        items: cartItems.map((ci) => {
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
    }

    await logActivity({
      userId: pending.user_id,
      action: 'order_placed',
      entity: 'orders',
      entityId: order.id,
      entityName: `Order #${order.id}`,
      metadata: { payment_method: pending.method, total: pending.total },
    })

    return NextResponse.json({ received: true, order_id: order.id })
  } catch (err: any) {
    console.error('PayMongo webhook processing error:', err)

    await adminSupabase
      .from('pending_paymongo_checkouts')
      .update({ status: 'failed', error: err.message })
      .eq('source_id', sourceId)

    return NextResponse.json({ received: true, error: err.message })
  }
}
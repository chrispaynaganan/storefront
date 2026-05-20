import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'

const PAYMONGO_SECRET = process.env.PAYMONGO_SECRET_KEY!
const PAYMONGO_BASE = 'https://api.paymongo.com/v1'

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
    const { address, promo_code } = body as {
      address: {
        line1: string
        line2?: string
        city: string
        province: string
        country: string
        postal_code: string
      }
      promo_code?: string
    }

    // Fetch cart items
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select(`
        id,
        qty,
        variant:variants(
          id,
          price,
          stock_qty,
          product:products(name)
        )
      `)
      .eq('user_id', user.id)

    if (cartError || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Validate stock
    for (const item of cartItems) {
      const variant = item.variant as any
      if (!variant || variant.stock_qty < item.qty) {
        return NextResponse.json(
          { error: `Insufficient stock for ${variant?.product?.name ?? 'an item'}` },
          { status: 400 }
        )
      }
    }

    // Calculate subtotal
    let subtotal = 0
    for (const item of cartItems) {
      const variant = item.variant as any
      subtotal += variant.price * item.qty
    }

    // Resolve promo discount
    let discount = 0
    if (promo_code) {
      const now = new Date().toISOString()
      const { data: promo } = await supabase
        .from('promos')
        .select('*')
        .eq('code', promo_code.toUpperCase())
        .eq('is_active', true)
        .lte('starts_at', now)
        .gte('ends_at', now)
        .single()

      if (promo) {
        discount =
          promo.type === 'percent'
            ? Math.round(subtotal * (promo.value / 100))
            : promo.value
      }
    }

    const total = subtotal - discount
    const amountInCentavos = Math.round(total * 100)

    // Create Payment Intent
    const intentRes = await fetch(`${PAYMONGO_BASE}/payment_intents`, {
      method: 'POST',
      headers: paymongoHeaders(),
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amountInCentavos,
            currency: 'PHP',
            payment_method_allowed: ['card'],
            capture_type: 'automatic',
            description: 'Known & Worn order',
            statement_descriptor: 'KNOWN AND WORN',
          },
        },
      }),
    })

    const intentJson = await intentRes.json()

    if (!intentRes.ok) {
      console.error('PayMongo create intent error:', JSON.stringify(intentJson, null, 2))
      return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 })
    }

    const intentId: string = intentJson.data.id
    const clientKey: string = intentJson.data.attributes.client_key

    // Save pending checkout
    const adminSupabase = await createAdminSupabaseClient()
    const { error: insertError } = await adminSupabase
      .from('pending_paymongo_checkouts')
      .insert({
        source_id: intentId, // reuse source_id column to store intent id
        user_id: user.id,
        address,
        promo_code: promo_code ?? null,
        subtotal,
        discount,
        total,
        method: 'card',
        status: 'pending',
      })

    if (insertError) {
      console.error('Failed to save pending checkout:', insertError)
      return NextResponse.json({ error: 'Failed to initiate checkout' }, { status: 500 })
    }

    return NextResponse.json({ intent_id: intentId, client_key: clientKey })
  } catch (err) {
    console.error('PayMongo create-intent error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
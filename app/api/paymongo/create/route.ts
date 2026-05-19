import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'

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
    const { method, address, promo_code } = body as {
      method: 'gcash' | 'maya'
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

    if (!['gcash', 'maya'].includes(method)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
    }

    // Fetch cart items with variant + product info
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

    // Build description
    const description = cartItems
      .map((item) => {
        const v = item.variant as any
        return `${v.product.name} x${item.qty}`
      })
      .join(', ')

    // PayMongo source type — gcash stays 'gcash', Maya uses 'paymaya' (legacy) or 'maya'
    // PayMongo currently accepts both; 'gcash' and 'paymaya' are the stable values
    const sourceType = method === 'gcash' ? 'gcash' : 'maya'
    const amountInCentavos = Math.round(total * 100)

    // Build redirect URLs
    const successUrl = `${SITE_URL}/checkout/return?status=success`
    const failedUrl = `${SITE_URL}/checkout/return?status=failed`

    const sourcePayload = {
      data: {
        attributes: {
          amount: amountInCentavos,
          currency: 'PHP',
          type: sourceType,
          redirect: {
            success: successUrl,
            failed: failedUrl,
          },
          billing: {
            name: user.email,
            email: user.email,
            address: {
              line1: address.line1,
              line2: address.line2 ?? '',
              city: address.city,
              state: address.province,
              country: 'PH',
              postal_code: address.postal_code,
            },
          },
          description,
        },
      },
    }

    const sourceRes = await fetch(`${PAYMONGO_BASE}/sources`, {
      method: 'POST',
      headers: paymongoHeaders(),
      body: JSON.stringify(sourcePayload),
    })

    const sourceJson = await sourceRes.json()

    if (!sourceRes.ok) {
      console.error('PayMongo source error:', JSON.stringify(sourceJson, null, 2))
      return NextResponse.json({ error: 'Failed to create payment source' }, { status: 500 })
    }

    const sourceId: string = sourceJson.data.id
    const checkoutUrl: string = sourceJson.data.attributes.redirect.checkout_url

    if (!checkoutUrl) {
      console.error('PayMongo: no checkout_url in response', sourceJson)
      return NextResponse.json({ error: 'No checkout URL returned from PayMongo' }, { status: 500 })
    }

    // Save pending checkout so webhook can resume
    const adminSupabase = await createAdminSupabaseClient()
    const { error: insertError } = await adminSupabase.from('pending_paymongo_checkouts').insert({
      source_id: sourceId,
      user_id: user.id,
      address,
      promo_code: promo_code ?? null,
      subtotal,
      discount,
      total,
      method,
      status: 'pending',
    })

    if (insertError) {
      console.error('Failed to save pending checkout:', insertError)
      return NextResponse.json({ error: 'Failed to initiate checkout' }, { status: 500 })
    }

    return NextResponse.json({ checkout_url: checkoutUrl, source_id: sourceId })
  } catch (err) {
    console.error('PayMongo create error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
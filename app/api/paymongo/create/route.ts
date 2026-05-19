import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

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
      .select(
        `
        id,
        qty,
        variant:variants(
          id,
          price,
          stock_qty,
          size,
          color,
          product:products(name)
        )
      `
      )
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
      const { data: promo } = await supabase
        .from('promos')
        .select('*')
        .eq('code', promo_code.toUpperCase())
        .eq('is_active', true)
        .lte('starts_at', new Date().toISOString())
        .gte('ends_at', new Date().toISOString())
        .single()

      if (promo) {
        discount =
          promo.type === 'percent'
            ? Math.round(subtotal * (promo.value / 100))
            : promo.value
      }
    }

    const total = subtotal - discount

    // Build line items description
    const description = cartItems
      .map((item) => {
        const v = item.variant as any
        return `${v.product.name} x${item.qty}`
      })
      .join(', ')

    // Store pending intent data in Supabase so webhook can resume it
    // We store as metadata on a temp record keyed by source_id after creation
    // For now, stash address + cart snapshot in a temp key we'll read in webhook

    // Create PayMongo Source
    const sourceType = method === 'gcash' ? 'gcash' : 'paymaya'
    const amountInCentavos = Math.round(total * 100)

    const sourceRes = await fetch(`${PAYMONGO_BASE}/sources`, {
      method: 'POST',
      headers: paymongoHeaders(),
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amountInCentavos,
            currency: 'PHP',
            type: sourceType,
            redirect: {
              success: `${SITE_URL}/checkout/return?source_id={id}&status=success`,
              failed: `${SITE_URL}/checkout/return?source_id={id}&status=failed`,
            },
            billing: {
              name: user.email,
              email: user.email,
              address: {
                line1: address.line1,
                line2: address.line2 ?? '',
                city: address.city,
                state: address.province,
                country: address.country || 'PH',
                postal_code: address.postal_code,
              },
            },
            description,
          },
        },
      }),
    })

    if (!sourceRes.ok) {
      const err = await sourceRes.json()
      console.error('PayMongo source error:', err)
      return NextResponse.json({ error: 'Failed to create payment source' }, { status: 500 })
    }

    const sourceData = await sourceRes.json()
    const source = sourceData.data
    const sourceId = source.id
    const checkoutUrl = source.attributes.redirect.checkout_url

    // Persist a pending_paymongo_checkout record so webhook can find cart + address
    const { error: insertError } = await supabase.from('pending_paymongo_checkouts').insert({
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
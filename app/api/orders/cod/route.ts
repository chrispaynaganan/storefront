import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'
import { logActivity } from '@/lib/activity-log'
import { sendOrderConfirmationEmail } from '@/lib/email/order-confirmation'
import { sendAdminNewOrderEmail } from '@/lib/email/order-status'

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
          color_hex,
          product:products(
            name,
            image_urls
          )
        )
      `
      )
      .eq('user_id', user.id)

    if (cartError || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    for (const item of cartItems) {
      const variant = item.variant as any
      if (!variant || variant.stock_qty < item.qty) {
        return NextResponse.json(
          { error: `Insufficient stock for ${variant?.product?.name ?? 'an item'}` },
          { status: 400 }
        )
      }
    }

    let subtotal = 0
    for (const item of cartItems) {
      const variant = item.variant as any
      subtotal += variant.price * item.qty
    }

    let discount = 0
    let appliedPromo: any = null

    if (promo_code) {
      const { data: promo } = await supabase
        .from('promos')
        .select('*')
        .eq('code', promo_code.toUpperCase())
        .eq('is_active', true)
        .lte('starts_at', new Date().toISOString())
        .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`)
        .single()

      if (promo) {
        // Check global usage limit
        const withinGlobalLimit = promo.max_usage === null || promo.usage_count < promo.max_usage

        // Check per-user usage
        const { data: existingUsage } = await supabase
          .from('promo_usages')
          .select('id')
          .eq('promo_id', promo.id)
          .eq('user_id', user.id)
          .single()

        if (withinGlobalLimit && !existingUsage) {
          appliedPromo = promo
          discount =
            promo.type === 'percent'
              ? Math.round(subtotal * (promo.value / 100))
              : promo.value
        }
      }
    }

    const total = subtotal - discount

    const adminSupabase = await createAdminSupabaseClient()

    const stockItems = cartItems.map((ci) => ({
      variant_id: (ci.variant as any).id,
      qty: ci.qty,
    }))

    const { data: stockResult, error: stockError } = await adminSupabase.rpc(
      'decrement_stock_for_items',
      { p_items: stockItems }
    )

    if (stockError || !stockResult?.success) {
      return NextResponse.json(
        { error: 'Some items are out of stock. Please refresh your cart.' },
        { status: 409 }
      )
    }

    const { data: savedAddress, error: addrError } = await adminSupabase
      .from('addresses')
      .insert({
        user_id: user.id,
        line1: address.line1,
        line2: address.line2 ?? null,
        city: address.city,
        province: address.province,
        country: address.country || 'PH',
        postal_code: address.postal_code,
        is_default: false,
      })
      .select('id')
      .single()

    if (addrError || !savedAddress) {
      return NextResponse.json({ error: 'Failed to save address' }, { status: 500 })
    }

    const { data: order, error: orderError } = await adminSupabase
      .from('orders')
      .insert({
        user_id: user.id,
        address_id: savedAddress.id,
        status: 'pending',
        subtotal,
        discount,
        total,
        currency: 'PHP',
        paypal_order_id: null,
        payment_method: 'cod',
      })
      .select('id')
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    const orderItems = cartItems.map((ci) => {
      const variant = ci.variant as any
      return {
        order_id: order.id,
        variant_id: variant.id,
        qty: ci.qty,
        unit_price: variant.price,
        line_total: variant.price * ci.qty,
      }
    })

    await adminSupabase.from('order_items').insert(orderItems)
    await adminSupabase.from('cart_items').delete().eq('user_id', user.id)

    // Increment global usage count + record per-user usage
    if (appliedPromo) {
      await adminSupabase.rpc('increment_promo_usage', { p_code: appliedPromo.code })
      await adminSupabase.from('promo_usages').insert({
        promo_id: appliedPromo.id,
        user_id: user.id,
        order_id: order.id,
      })
    }

    const { data: userProfile } = await adminSupabase
      .from('users')
      .select('email, first_name, full_name')
      .eq('id', user.id)
      .single()

    if (userProfile) {
      await sendOrderConfirmationEmail({
        order_id: order.id,
        customer_name: userProfile.first_name ?? userProfile.full_name ?? 'Customer',
        customer_email: userProfile.email,
        subtotal,
        discount,
        total,
        currency: 'PHP',
        paypal_order_id: 'COD',
        address: {
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          province: address.province,
          postal_code: address.postal_code,
          country: address.country || 'PH',
        },
        items: cartItems.map((ci) => {
          const variant = ci.variant as any
          const imageUrls: string[] = variant.product?.image_urls ?? []
          return {
            name: variant.product?.name ?? 'Item',
            size: variant.size ?? '',
            color: variant.color ?? '',
            color_hex: variant.color_hex ?? '#000000',
            qty: ci.qty,
            unit_price: variant.price,
            line_total: variant.price * ci.qty,
            image_url: imageUrls[0] ?? undefined,
          }
        }),
      })

      await sendAdminNewOrderEmail({
        order_id: order.id,
        customer_name: userProfile.first_name ?? userProfile.full_name ?? 'Customer',
        customer_email: userProfile.email,
        total,
        payment_method: 'cod',
        item_count: cartItems.length,
      })
    }

    await logActivity({
      userId: user.id,
      action: 'order_placed',
      entity: 'orders',
      entityId: order.id,
      entityName: `Order #${order.id}`,
      metadata: { payment_method: 'cod', total },
    })

    return NextResponse.json({ order_id: order.id })
  } catch (err) {
    console.error('COD order error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
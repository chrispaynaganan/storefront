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
      const errMsg =
        attachJson?.errors?.[0]?.detail ?? 'Failed to process card payment'
      return NextResponse.json({ error: errMsg }, { status: 400 })
    }

    const status: string = attachJson.data.attributes.status
    const nextAction = attachJson.data.attributes.next_action

    // 3DS required — return redirect URL to client
    if (status === 'awaiting_next_action' && nextAction?.type === 'redirect') {
      return NextResponse.json({
        status: '3ds_required',
        redirect_url: nextAction.redirect.url,
      })
    }

    // Payment succeeded without 3DS
    if (status === 'succeeded') {
      return NextResponse.json({ status: 'succeeded', intent_id })
    }

    // Payment failed
    return NextResponse.json({
      status: 'failed',
      error: attachJson.data.attributes.last_payment_error?.failed_message ?? 'Payment failed',
    })
  } catch (err) {
    console.error('PayMongo attach-intent error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
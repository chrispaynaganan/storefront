import { NextResponse } from 'next/server'
export async function POST(req: Request) {
  // TODO: verify PayPal webhook signature and update order status
  return NextResponse.json({ received: true })
}

import { NextResponse } from 'next/server'
import { createPayPalOrder } from '@/lib/paypal'
export async function POST(req: Request) {
  const { amount, currency } = await req.json()
  const order = await createPayPalOrder(amount, currency)
  return NextResponse.json(order)
}

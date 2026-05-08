import { NextResponse } from 'next/server'
import { capturePayPalOrder } from '@/lib/paypal'
export async function POST(req: Request) {
  const { orderId } = await req.json()
  const capture = await capturePayPalOrder(orderId)
  return NextResponse.json(capture)
}

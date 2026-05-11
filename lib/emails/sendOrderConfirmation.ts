import { Resend } from 'resend'
import { OrderConfirmationEmail } from './OrderConfirmationEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

interface Params {
  to: string
  orderNumber: string
  items: { name: string; size: string; qty: number; line_total: number }[]
  total: number
  address: {
    line1: string
    line2?: string
    city: string
    province: string
    country: string
    postal_code: string
  }
}

export async function sendOrderConfirmation(params: Params) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
    to: params.to,
    subject: `Order confirmed — #${params.orderNumber}`,
    react: OrderConfirmationEmail({
      orderNumber: params.orderNumber,
      items: params.items,
      total: params.total,
      address: params.address,
    }),
  })
}
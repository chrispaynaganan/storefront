'use client'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'

interface Props {
  amount: number
  onSuccess: (orderId: string) => void
  onBeforeApprove?: () => Promise<boolean>
}

export function PayPalButton({ amount, onSuccess, onBeforeApprove }: Props) {
  return (
    <PayPalScriptProvider options={{
      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
      currency: 'PHP',
    }}>
      <PayPalButtons
        style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' }}
        disabled={amount <= 0}
        createOrder={async () => {
          const res = await fetch('/api/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, currency: 'PHP' }),
          })
          const data = await res.json()
          return data.id
        }}
        onApprove={async (data) => {
          // Run stock check before proceeding
          if (onBeforeApprove) {
            const ok = await onBeforeApprove()
            if (!ok) return
          }

          // Pass orderID to CheckoutClient which calls our capture route
          // Do NOT capture here — /api/orders/capture handles it server-side
          onSuccess(data.orderID)
        }}
      />
    </PayPalScriptProvider>
  )
}
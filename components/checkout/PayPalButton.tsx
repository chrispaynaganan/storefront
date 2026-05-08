'use client'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'

interface Props {
  amount: number
  onSuccess: (orderId: string) => void
}

export function PayPalButton({ amount, onSuccess }: Props) {
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
          const res = await fetch('/api/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: data.orderID }),
          })
          const capture = await res.json()
          if (capture.status === 'COMPLETED') {
            onSuccess(data.orderID)
          }
        }}
      />
    </PayPalScriptProvider>
  )
}
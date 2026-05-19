'use client'

import clsx from 'clsx'

export type PaymentMethod = 'paypal' | 'gcash' | 'maya' | 'cod'

interface PaymentMethodSelectorProps {
  selected: PaymentMethod
  onChange: (method: PaymentMethod) => void
}

const methods: { id: PaymentMethod; label: string; sub: string }[] = [
  { id: 'gcash', label: 'GCash', sub: 'Pay via GCash e-wallet' },
  { id: 'maya', label: 'Maya', sub: 'Pay via Maya e-wallet' },
  { id: 'paypal', label: 'PayPal', sub: 'Pay via PayPal' },
  { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when your order arrives' },
]

export default function PaymentMethodSelector({ selected, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-brown">Payment method</p>
      <div className="grid grid-cols-1 gap-2">
        {methods.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={clsx(
              'flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all',
              selected === m.id
                ? 'border-brown bg-peach-light'
                : 'border-whitewash-off bg-white hover:border-brown/40'
            )}
          >
            <span
              className={clsx(
                'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                selected === m.id ? 'border-brown' : 'border-brown/30'
              )}
            >
              {selected === m.id && (
                <span className="h-2 w-2 rounded-full bg-brown" />
              )}
            </span>
            <span>
              <span className="block text-sm font-medium text-brown">{m.label}</span>
              <span className="block text-xs text-brown/60">{m.sub}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FaqItem {
  q: string
  a: string
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="border border-peach-light rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-whitewash transition-colors"
          >
            <span className="text-sm font-medium text-brown pr-4">{item.q}</span>
            {open === i
              ? <ChevronUp className="w-4 h-4 text-brown/40 shrink-0" />
              : <ChevronDown className="w-4 h-4 text-brown/40 shrink-0" />
            }
          </button>
          {open === i && (
            <div className="px-5 py-4 bg-whitewash border-t border-peach-light">
              <p className="text-sm text-brown-light leading-relaxed">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Variant } from '@/types'

interface Props { variants: Variant[]; onSelect?: (v: Variant) => void }

export function ProductVariantSelector({ variants, onSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const sizes = [...new Set(variants.map(v => v.size))]

  function select(size: string) {
    setSelected(size)
    const v = variants.find(v => v.size === size)
    if (v && onSelect) onSelect(v)
  }

  return (
    <div className="mt-6">
      <p className="text-sm text-brown mb-2">Size</p>
      <div className="flex gap-2 flex-wrap">
        {sizes.map(size => {
          const v = variants.find(v => v.size === size)
          const outOfStock = v ? v.stock_qty === 0 : false
          return (
            <button
              key={size}
              onClick={() => !outOfStock && select(size)}
              disabled={outOfStock}
              className={cn(
                'w-12 h-12 rounded-lg border text-sm font-medium transition-colors',
                selected === size ? 'bg-brown text-white border-brown' : 'border-peach text-brown hover:border-brown',
                outOfStock && 'opacity-30 cursor-not-allowed line-through'
              )}
            >
              {size}
            </button>
          )
        })}
      </div>
    </div>
  )
}

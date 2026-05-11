'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Variant } from '@/types'

const PRESET_COLORS = [
  { label: 'Black', value: '#000000' },
  { label: 'White', value: '#FFFFFF' },
  { label: 'Gray', value: '#9CA3AF' },
  { label: 'Brown', value: '#3B1F0E' },
  { label: 'Beige', value: '#F5F0E8' },
  { label: 'Navy', value: '#1E3A5F' },
  { label: 'Olive', value: '#6B7C3F' },
  { label: 'Red', value: '#DC2626' },
  { label: 'Pink', value: '#FFCBA4' },
]

function getColorLabel(hex: string): string {
  return PRESET_COLORS.find(c => c.value.toLowerCase() === hex.toLowerCase())?.label ?? hex
}

interface Props {
  variants: Variant[]
  onSelect?: (v: Variant) => void
}

export function ProductVariantSelector({ variants, onSelect }: Props) {
  const colors = [...new Set(variants.map(v => v.color).filter(Boolean))] as string[]
  const sizes = [...new Set(variants.map(v => v.size))]
  const hasColors = colors.length > 0

  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] ?? null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  const availableSizes = hasColors
    ? variants.filter(v => v.color === selectedColor).map(v => v.size)
    : sizes

  function selectColor(color: string) {
    setSelectedColor(color)
    setSelectedSize(null)
    onSelect && onSelect(null as any)
  }

  function selectSize(size: string) {
    setSelectedSize(size)
    const v = variants.find(v =>
      v.size === size && (!hasColors || v.color === selectedColor)
    )
    if (v && onSelect) onSelect(v)
  }

  return (
    <div className="space-y-5 mt-6">
      {/* Color selector */}
      {hasColors && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-brown">Color</p>
            {selectedColor && (
              <p className="text-xs text-brown-light">{getColorLabel(selectedColor)}</p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {colors.map(color => {
              const hasStock = variants.some(v => v.color === color && v.stock_qty > 0)
              return (
                <button
                  key={color}
                  onClick={() => hasStock && selectColor(color)}
                  disabled={!hasStock}
                  title={getColorLabel(color)}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all',
                    selectedColor === color ? 'border-brown scale-110' : 'border-transparent hover:border-brown/40',
                    !hasStock && 'opacity-30 cursor-not-allowed'
                  )}
                  style={{ backgroundColor: color }}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Size selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-brown">Size</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {sizes.map(size => {
            const available = availableSizes.includes(size)
            const v = variants.find(v =>
              v.size === size && (!hasColors || v.color === selectedColor)
            )
            const outOfStock = v ? v.stock_qty === 0 : !available
            return (
              <button
                key={size}
                onClick={() => !outOfStock && selectSize(size)}
                disabled={outOfStock || !available}
                className={cn(
                  'w-12 h-12 rounded-lg border text-sm font-medium transition-colors',
                  selectedSize === size
                    ? 'bg-brown text-whitewash border-brown'
                    : available && !outOfStock
                    ? 'border-peach text-brown hover:border-brown'
                    : 'border-peach text-brown/30 opacity-40 cursor-not-allowed line-through'
                )}
              >
                {size}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
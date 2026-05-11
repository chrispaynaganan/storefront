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
  onSelect?: (v: Variant | null) => void
}

export function ProductVariantSelector({ variants, onSelect }: Props) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  // All unique sizes
  const sizes = [...new Set(variants.map(v => v.size))]

  // All unique colors across all variants
  const allColors = [...new Set(variants.map(v => v.color).filter(Boolean))] as string[]
  const hasColors = allColors.length > 0

  // Colors available for selected size
  const colorsForSize = selectedSize
    ? variants.filter(v => v.size === selectedSize).map(v => v.color).filter(Boolean) as string[]
    : []

  // In-stock colors for selected size
  const inStockColorsForSize = selectedSize
    ? variants.filter(v => v.size === selectedSize && v.stock_qty > 0).map(v => v.color).filter(Boolean) as string[]
    : []

  // Is a size in stock at all (any color)
  function isSizeInStock(size: string) {
    return variants.some(v => v.size === size && v.stock_qty > 0)
  }

  // Is a size available (has variants)
  function isSizeAvailable(size: string) {
    return variants.some(v => v.size === size)
  }

  function selectSize(size: string) {
    setSelectedSize(size)
    setSelectedColor(null)
    onSelect?.(null)
  }

  function selectColor(color: string) {
    setSelectedColor(color)
    const v = variants.find(v => v.size === selectedSize && v.color === color)
    onSelect?.(v ?? null)
  }

  // If no colors — selecting size is enough
  function handleSizeOnlySelect(size: string) {
    setSelectedSize(size)
    const v = variants.find(v => v.size === size)
    onSelect?.(v ?? null)
  }

  return (
    <div className="space-y-5 mt-6">
      {/* Size selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-brown">Size</p>
          {selectedSize && (
            <p className="text-xs text-brown-light">{selectedSize}</p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {sizes.map(size => {
            const available = isSizeAvailable(size)
            const inStock = isSizeInStock(size)
            const isSelected = selectedSize === size
            return (
              <button
                key={size}
                onClick={() => {
                  if (!inStock) return
                  hasColors ? selectSize(size) : handleSizeOnlySelect(size)
                }}
                disabled={!available || !inStock}
                className={cn(
                  'w-12 h-12 rounded-lg border text-sm font-medium transition-colors',
                  isSelected
                    ? 'bg-brown text-whitewash border-brown'
                    : inStock
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

      {/* Color selector — only shows after size is picked */}
      {hasColors && selectedSize && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-brown">Color</p>
            {selectedColor && (
              <p className="text-xs text-brown-light">{getColorLabel(selectedColor)}</p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {allColors.map(color => {
              const availableForSize = colorsForSize.includes(color)
              const inStockForSize = inStockColorsForSize.includes(color)
              const isSelected = selectedColor === color
              return (
                <button
                  key={color}
                  onClick={() => {
                    if (!availableForSize || !inStockForSize) return
                    selectColor(color)
                  }}
                  disabled={!availableForSize || !inStockForSize}
                  title={getColorLabel(color)}
                  className={cn(
                    'w-9 h-9 rounded-full border-2 transition-all relative',
                    isSelected
                      ? 'border-brown scale-110'
                      : availableForSize && inStockForSize
                      ? 'border-transparent hover:border-brown/40'
                      : 'border-transparent opacity-30 cursor-not-allowed'
                  )}
                  style={{ backgroundColor: color }}
                >
                  {/* Out of stock slash */}
                  {availableForSize && !inStockForSize && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <line x1="4" y1="32" x2="32" y2="4" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </span>
                  )}
                  {/* Not available for this size */}
                  {!availableForSize && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <line x1="4" y1="32" x2="32" y2="4" stroke="rgba(0,0,0,0.2)" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          {selectedSize && !selectedColor && (
            <p className="text-xs text-brown/40 mt-2">Select a color to continue</p>
          )}
        </div>
      )}
    </div>
  )
}
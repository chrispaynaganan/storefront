'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/utils'
import type { Variant } from '@/types'

interface Props {
  variants: Variant[]
  productId: string
  description?: string | null
}

// Derive unique sizes and colors from variants
function getSizes(variants: Variant[]) {
  const seen = new Set<string>()
  return variants
    .filter(v => v.size && !seen.has(v.size) && seen.add(v.size))
    .map(v => v.size as string)
}

function getColors(variants: Variant[]) {
  const seen = new Set<string>()
  return variants
    .filter(v => v.color && !seen.has(v.color) && seen.add(v.color))
    .map(v => ({ color: v.color as string, hex: v.color_hex as string | undefined }))
}

function findVariant(variants: Variant[], size: string | null, color: string | null) {
  return variants.find(v =>
    (size ? v.size === size : true) &&
    (color ? v.color === color : true)
  ) ?? null
}

export function AddToCartButton({ variants, productId, description }: Props) {
  const sizes = getSizes(variants)
  const colors = getColors(variants)

  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0] ?? null)
  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0]?.color ?? null)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [buying, setBuying] = useState(false)
  const [added, setAdded] = useState(false)
  const { refreshCart } = useCart()

  const selected = findVariant(variants, selectedSize, selectedColor)
  const total = selected ? selected.price * qty : null

  async function upsertCartItem() {
    if (!selected) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return null }

    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, qty')
      .eq('user_id', user.id)
      .eq('variant_id', selected.id)
      .single()

    if (existing) {
      await supabase.from('cart_items').update({ qty: existing.qty + qty }).eq('id', existing.id)
    } else {
      await supabase.from('cart_items').insert({ user_id: user.id, variant_id: selected.id, qty })
    }

    await refreshCart()
    return true
  }

  async function addToCart() {
    if (!selected) return
    setAdding(true)
    await upsertCartItem()
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
    setAdding(false)
  }

  async function buyNow() {
    if (!selected) return
    setBuying(true)
    const ok = await upsertCartItem()
    if (ok) window.location.href = '/checkout'
    setBuying(false)
  }

  const isOutOfStock = selected ? selected.stock_qty <= 0 : false
  const lowStock = selected && selected.stock_qty > 0 && selected.stock_qty <= 5

  return (
    <div className="mt-6 space-y-6">

      {/* Size selector */}
      {sizes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-brown">Select Size</p>
            <button className="text-xs text-brown underline underline-offset-2 hover:text-brown-light transition-colors">
              Measurement Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map(size => {
              const available = variants.some(
                v => v.size === size &&
                  (selectedColor ? v.color === selectedColor : true) &&
                  v.stock_qty > 0
              )
              const isActive = selectedSize === size
              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  disabled={!available}
                  className={`w-12 h-12 rounded-full text-sm font-medium transition-all duration-150
                    ${isActive
                      ? 'bg-brown text-whitewash'
                      : available
                        ? 'bg-whitewash-off text-brown hover:bg-peach-light/40'
                        : 'bg-whitewash-off text-brown/30 cursor-not-allowed line-through'
                    }`}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Color selector */}
      {colors.length > 0 && (
        <div>
          <p className="text-sm font-medium text-brown mb-3">Select Color</p>
          <div className="flex flex-wrap gap-2.5">
            {colors.map(({ color, hex }) => {
              const isActive = selectedColor === color
              const bgStyle = hex ? { backgroundColor: hex } : {}
              // Determine if white/light swatch — show border
              const isLight = hex && (
                hex.toLowerCase() === '#ffffff' ||
                hex.toLowerCase() === '#fff' ||
                hex.toLowerCase() === '#fafaf4' ||
                hex.toLowerCase() === '#f5f5f5'
              )
              return (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  title={color}
                  style={bgStyle}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-150
                    ${isLight ? 'border border-peach' : ''}
                    ${isActive ? 'ring-2 ring-offset-2 ring-brown' : 'hover:scale-105'}
                  `}
                >
                  {isActive && (
                    <svg
                      className={`w-5 h-5 ${isLight ? 'text-brown' : 'text-white'}`}
                      fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <p className="text-sm font-medium text-brown mb-3">Qty</p>
        <div className="flex items-center gap-3">
          {/* Number display — pill */}
          <div className="w-24 h-12 bg-whitewash-off rounded-full flex items-center justify-center">
            <span className="text-base font-medium text-brown">{qty}</span>
          </div>
          {/* Minus */}
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-12 h-12 rounded-full border border-peach-light flex items-center justify-center text-brown hover:bg-whitewash-off transition-colors text-lg"
          >
            −
          </button>
          {/* Plus */}
          <button
            onClick={() => setQty(q => Math.min(selected?.stock_qty ?? 10, q + 1))}
            disabled={!selected || qty >= (selected?.stock_qty ?? 10)}
            className="w-12 h-12 rounded-full border border-peach-light flex items-center justify-center text-brown hover:bg-whitewash-off transition-colors disabled:opacity-40 text-lg"
          >
            +
          </button>
        </div>
        {lowStock && (
          <p className="text-xs text-brown-light mt-2">Only {selected!.stock_qty} left in stock</p>
        )}
      </div>

      {/* CTA row */}
      <div className="flex items-center gap-3">
        {/* Purchase — grows */}
        <button
          onClick={buyNow}
          disabled={!selected || buying || isOutOfStock}
          className="flex-1 bg-brown text-whitewash font-medium py-4 rounded-full transition-colors hover:bg-brown-light disabled:opacity-40 disabled:cursor-not-allowed text-base"
        >
          {buying ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner />
              Going to checkout…
            </span>
          ) : isOutOfStock ? 'Out of Stock' : (
            `Purchase${total ? ` (${formatPrice(total)})` : ''}`
          )}
        </button>

        {/* Add to bag — icon only */}
        <button
          onClick={addToCart}
          disabled={!selected || adding || isOutOfStock}
          title={added ? 'Added!' : 'Add to bag'}
          className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 transition-all
            ${added
              ? 'border-brown bg-brown/10 text-brown'
              : 'border-peach-light text-brown hover:bg-whitewash-off'
            }
            disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {adding ? (
            <Spinner className="w-5 h-5" />
          ) : added ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Description card */}
      {description && (
        <div className="border border-peach-light rounded-2xl px-5 py-5 mt-2">
          <h3 className="text-sm font-semibold text-brown mb-2">Description and Fit</h3>
          <div
            className="prose prose-sm text-brown-light max-w-none
              prose-p:leading-relaxed prose-p:text-brown-light prose-p:text-sm"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      )}
    </div>
  )
}

function Spinner({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  )
}
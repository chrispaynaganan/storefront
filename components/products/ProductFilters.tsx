'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: low to high', value: 'price_asc' },
  { label: 'Price: high to low', value: 'price_desc' },
]

export function ProductFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const selectedSizes = searchParams.get('sizes')?.split(',').filter(Boolean) ?? []
  const inStock = searchParams.get('in_stock') === 'true'
  const sort = searchParams.get('sort') ?? 'newest'

  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') params.delete(key)
      else params.set(key, value)
    })
    router.push(`${pathname}?${params.toString()}`)
  }, [searchParams, router, pathname])

  function toggleSize(size: string) {
    const next = selectedSizes.includes(size)
      ? selectedSizes.filter(s => s !== size)
      : [...selectedSizes, size]
    updateParams({ sizes: next.join(',') || null })
  }

  function clearAll() {
    router.push(pathname)
  }

  const hasFilters = selectedSizes.length > 0 || inStock || sort !== 'newest'

  return (
    <aside className="w-48 shrink-0 hidden md:block space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-brown">Filter</p>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-brown-light hover:text-brown underline transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* Sort */}
      <div>
        <p className="text-xs text-brown/50 uppercase tracking-wider mb-2">Sort</p>
        <div className="space-y-1">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => updateParams({ sort: opt.value === 'newest' ? null : opt.value })}
              className={`block w-full text-left text-sm py-1 transition-colors ${
                sort === opt.value ? 'text-brown font-medium' : 'text-brown/50 hover:text-brown'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <p className="text-xs text-brown/50 uppercase tracking-wider mb-2">Size</p>
        <div className="flex flex-wrap gap-2">
          {SIZES.map(size => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`w-10 h-10 rounded-lg border text-xs font-medium transition-colors ${
                selectedSizes.includes(size)
                  ? 'bg-brown text-whitewash border-brown'
                  : 'border-peach text-brown hover:border-brown'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* In stock */}
      <div>
        <p className="text-xs text-brown/50 uppercase tracking-wider mb-2">Availability</p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStock}
            onChange={e => updateParams({ in_stock: e.target.checked ? 'true' : null })}
            className="accent-brown w-4 h-4"
          />
          <span className="text-sm text-brown">In stock only</span>
        </label>
      </div>
    </aside>
  )
}
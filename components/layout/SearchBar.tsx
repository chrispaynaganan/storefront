'use client'
import { useState, useEffect, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface SearchResult {
  id: string
  name: string
  slug: string
  image_urls: string[]
  variants: { price: number }[]
}

interface Props {
  onNavigate?: () => void
}

export function SearchBar({ onNavigate }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setResults([])
      setOpen(false)
      setNotFound(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data: SearchResult[] = await res.json()
        setResults(data)
        setNotFound(data.length === 0)
        setOpen(true)
        setActiveIndex(-1)
      } catch {
        setResults([])
        setNotFound(false)
      } finally {
        setLoading(false)
      }
    }, 200)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function navigate(path: string) {
    setOpen(false)
    setQuery('')
    setResults([])
    setNotFound(false)
    onNavigate?.()
    startTransition(() => router.push(path))
  }

  function submitSearch() {
    const trimmed = query.trim()
    navigate(trimmed ? `/products?q=${encodeURIComponent(trimmed)}` : '/products')
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    submitSearch()
  }

  function handleSelect(slug: string) {
    navigate(`/products/${slug}`)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(results[activeIndex].slug)
    } else if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  function formatPrice(variants: { price: number }[]) {
    if (!variants?.length) return ''
    const min = Math.min(...variants.map(v => v.price))
    return `₱${min.toLocaleString()}`
  }

  const showDropdown = open && query.trim().length >= 2

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleFormSubmit}>
        <div className="relative flex items-center">
          <svg
            className="absolute left-3 w-3.5 h-3.5 text-brown-light shrink-0 pointer-events-none"
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.trim().length >= 2 && setOpen(true)}
            placeholder="Search products..."
            autoComplete="off"
            className="w-full bg-whitewash-off hover:bg-[#ECEAE6] transition-colors rounded-full h-8.5 pl-9 pr-4 text-[13px] text-brown placeholder:text-brown-light/60 focus:outline-none focus:ring-2 focus:ring-peach"
          />
          {(loading || isPending) && (
            <div className="absolute right-3 w-3.5 h-3.5 border-2 border-brown-light border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </form>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-peach-light shadow-lg overflow-hidden z-50">

          {/* Search all row — always shown when dropdown is open */}
          <button
            type="button"
            onClick={submitSearch}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-whitewash transition-colors border-b border-peach-light"
          >
            <svg className="w-3.5 h-3.5 text-brown-light shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z" />
            </svg>
            <span className="text-[13px] text-brown-light">
              Search for <span className="text-brown font-medium">"{query}"</span>
            </span>
          </button>

          {/* No results */}
          {notFound && !loading && (
            <div className="px-4 py-4 text-center">
              <p className="text-[13px] text-brown/40">No products found for "{query}"</p>
            </div>
          )}

          {/* Product suggestions */}
          {results.map((result, i) => (
            <button
              key={result.id}
              type="button"
              onClick={() => handleSelect(result.slug)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${
                i === activeIndex ? 'bg-whitewash-off' : 'hover:bg-whitewash'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-whitewash-off shrink-0 overflow-hidden">
                {result.image_urls?.[0] && (
                  <Image
                    src={result.image_urls[0]}
                    alt={result.name}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-brown truncate">{result.name}</p>
                <p className="text-[11px] text-brown-light">{formatPrice(result.variants)}</p>
              </div>
              <svg className="w-3.5 h-3.5 text-brown-light/40 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
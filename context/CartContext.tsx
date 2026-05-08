'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import type { CartItem } from '@/types'

interface CartContextValue {
  items: CartItem[]
  count: number
  isOpen: boolean
  setItems: (items: CartItem[]) => void
  openCart: () => void
  closeCart: () => void
  refresh: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const count = items.reduce((sum, item) => sum + item.qty, 0)

  function openCart() { setIsOpen(true) }
  function closeCart() { setIsOpen(false) }
  function refresh() { /* will fetch cart from API */ }

  return (
    <CartContext.Provider value={{ items, count, isOpen, setItems, openCart, closeCart, refresh }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCartContext() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCartContext must be used within CartProvider')
  return ctx
}

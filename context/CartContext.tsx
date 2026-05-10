'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

type CartContextType = {
  cartCount: number
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType>({ cartCount: 0, refreshCart: async () => {} })

export function CartProvider({ children, initialCount = 0 }: { children: React.ReactNode, initialCount?: number }) {
  const [cartCount, setCartCount] = useState(initialCount)

  async function refreshCart() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setCartCount(0); return }
    const { count } = await supabase
      .from('cart_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    setCartCount(count ?? 0)
  }

  useEffect(() => { refreshCart() }, [])

  return (
    <CartContext.Provider value={{ cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
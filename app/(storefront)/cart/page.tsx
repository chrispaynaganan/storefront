import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/auth'
import { EmptyState } from '@/components/ui/EmptyState'
import { CartPageClient } from '@/components/cart/CartPageClient'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export const metadata = { title: 'Your Cart' }

export default async function CartPage() {
  const user = await getUser()

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-light text-[#3B1F0E] mb-4">Your cart</h1>
        <p className="text-[#6B3A22] mb-6">Sign in to view your cart</p>
        <Link href="/login">
          <Button className="bg-[#3B1F0E] text-white hover:bg-[#6B3A22] px-8 py-3 rounded-lg">
            Sign in
          </Button>
        </Link>
      </div>
    )
  }

  const supabase = await createServerSupabaseClient()
  const { data: cartItems } = await supabase
    .from('cart_items')
    .select('*, variant:variants(*, product:products(*))')
    .eq('user_id', user.id)
    .order('added_at', { ascending: true })

  return (
    <CartPageClient cartItems={cartItems ?? []} />
  )
}
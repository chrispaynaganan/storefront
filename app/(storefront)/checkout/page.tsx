import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CheckoutClient } from '@/components/checkout/CheckoutClient'

export const metadata = { title: 'Checkout' }

export default async function CheckoutPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createServerSupabaseClient()
  const { data: cartItems } = await supabase
    .from('cart_items')
    .select('*, variant:variants(*, product:products(*))')
    .eq('user_id', user.id)
    .order('added_at', { ascending: true })

  if (!cartItems?.length) redirect('/cart')

  const subtotal = cartItems.reduce((sum, item) =>
    sum + (item.variant?.price ?? 0) * item.qty, 0)

  return <CheckoutClient cartItems={cartItems} subtotal={subtotal} userId={user.id} />
}
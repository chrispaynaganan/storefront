import { createServerSupabaseClient } from './supabase-server'
import type { CartItem } from '@/types'

export async function getCart(userId: string): Promise<CartItem[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('cart_items')
    .select('*, variant:variants(*, product:products(*))')
    .eq('user_id', userId)
    .order('added_at', { ascending: true })
  return data ?? []
}

export async function getCartCount(userId: string): Promise<number> {
  const supabase = await createServerSupabaseClient()
  const { count } = await supabase
    .from('cart_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  return count ?? 0
}

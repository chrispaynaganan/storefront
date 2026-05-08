import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function getFavoritedProductIds(): Promise<Set<string>> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Set()

  const { data } = await supabase
    .from('favorites')
    .select('product_id')
    .eq('user_id', user.id)

  return new Set((data ?? []).map(f => f.product_id))
}
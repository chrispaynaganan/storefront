import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 2) return NextResponse.json([])

  const supabase = await createServerSupabaseClient()

  const { data } = await supabase
    .from('products')
    .select('id, name, slug, image_urls, variants(price)')
    .eq('is_active', true)
    .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
    .limit(6)

  return NextResponse.json(data ?? [])
}
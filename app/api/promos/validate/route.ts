import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')?.toUpperCase().trim()

  if (!code) {
    return NextResponse.json({ valid: false, error: 'No code provided' }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const now = new Date().toISOString()

  const { data: promo, error } = await supabase
    .from('promos')
    .select('id, code, type, value, starts_at, ends_at, is_active')
    .eq('code', code)
    .eq('is_active', true)
    .lte('starts_at', now)
    .gte('ends_at', now)
    .single()

  if (error || !promo) {
    return NextResponse.json({ valid: false, error: 'Invalid or expired promo code' })
  }

  return NextResponse.json({
    valid: true,
    code: promo.code,
    type: promo.type,
    value: promo.value,
  })
}
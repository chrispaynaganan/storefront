import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')?.toUpperCase().trim()

  if (!code) {
    return NextResponse.json({ valid: false, error: 'No code provided' }, { status: 400 })
  }

  const supabase = await createServerSupabaseClient()
  const now = new Date().toISOString()

  // Get current user (optional — guests can't have per-user tracking)
  const { data: { user } } = await supabase.auth.getUser()

  const { data: promo, error } = await supabase
    .from('promos')
    .select('id, code, type, value, starts_at, ends_at, is_active, max_usage, usage_count')
    .eq('code', code)
    .eq('is_active', true)
    .lte('starts_at', now)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .single()

  if (error || !promo) {
    return NextResponse.json({ valid: false, error: 'Invalid or expired promo code' })
  }

  // Check global usage limit
  if (promo.max_usage !== null && promo.usage_count >= promo.max_usage) {
    return NextResponse.json({ valid: false, error: 'This promo code has reached its usage limit' })
  }

  // Check per-user usage (only if logged in)
  if (user) {
    const { data: existingUsage } = await supabase
      .from('promo_usages')
      .select('id')
      .eq('promo_id', promo.id)
      .eq('user_id', user.id)
      .single()

    if (existingUsage) {
      return NextResponse.json({ valid: false, error: 'You have already used this promo code' })
    }
  }

  return NextResponse.json({
    valid: true,
    code: promo.code,
    type: promo.type,
    value: promo.value,
  })
}
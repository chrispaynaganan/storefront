import { createServerSupabaseClient } from '@/lib/supabase-server'

/**
 * Fetches a site_section by key and returns its content merged with fallback defaults.
 * Falls back gracefully if the row doesn't exist yet.
 */
export async function getSectionContent<T extends Record<string, unknown>>(
  key: string,
  defaults: T
): Promise<T> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from('site_sections')
      .select('content')
      .eq('section_key', key)
      .single()
    if (!data?.content) return defaults
    return { ...defaults, ...(data.content as T) }
  } catch {
    return defaults
  }
}

/**
 * Fetches global site_settings row.
 * Falls back to hardcoded defaults if row doesn't exist.
 */
export async function getSiteSettings() {
  const defaults = {
    footer_tagline: 'Clean, expressive streetwear. Built for everyday wear, made in the Philippines.',
    facebook_url: 'https://www.facebook.com/profile.php?id=61570705350137',
    email: 'mark.payns@gmail.com',
    tiktok_url: '#',
    shopee_url: '#',
    lazada_url: '#',
  }
  try {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single()
    if (!data) return defaults
    return { ...defaults, ...data }
  } catch {
    return defaults
  }
}
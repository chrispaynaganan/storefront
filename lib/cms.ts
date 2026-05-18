import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { SitePage, SiteSection, SiteSettings, Block } from '@/types/cms'

// ─────────────────────────────────────────────
// site_settings
// ─────────────────────────────────────────────

export async function getSettings(): Promise<SiteSettings | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .single()
  return data ?? null
}

export async function saveSettings(
  values: Partial<Omit<SiteSettings, 'id' | 'updated_at'>>
): Promise<{ error: string | null }> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('site_settings')
    .update(values)
    .eq('id', 1)
  return { error: error?.message ?? null }
}

// ─────────────────────────────────────────────
// site_sections
// ─────────────────────────────────────────────

export async function getAllSections(): Promise<SiteSection[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('site_sections')
    .select('*')
    .order('label')
  return data ?? []
}

export async function getSection(key: string): Promise<SiteSection | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('site_sections')
    .select('*')
    .eq('section_key', key)
    .single()
  return data ?? null
}

export async function saveSection(
  key: string,
  content: Record<string, unknown>
): Promise<{ error: string | null }> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('site_sections')
    .update({ content })
    .eq('section_key', key)
  return { error: error?.message ?? null }
}

// ─────────────────────────────────────────────
// site_pages
// ─────────────────────────────────────────────

export async function getAllPages(): Promise<SitePage[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('site_pages')
    .select('*')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getPage(id: string): Promise<SitePage | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('site_pages')
    .select('*')
    .eq('id', id)
    .single()
  return data ?? null
}

export async function getPublishedPageBySlug(slug: string): Promise<SitePage | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('site_pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  return data ?? null
}

export async function createPage(
  title: string,
  slug: string
): Promise<{ data: SitePage | null; error: string | null }> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('site_pages')
    .insert({ title, slug, blocks: [], is_published: false })
    .select()
    .single()
  return { data: data ?? null, error: error?.message ?? null }
}

export async function savePage(
  id: string,
  values: { title?: string; slug?: string; blocks?: Block[] }
): Promise<{ error: string | null }> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('site_pages')
    .update(values)
    .eq('id', id)
  return { error: error?.message ?? null }
}

export async function togglePagePublish(
  id: string,
  publish: boolean
): Promise<{ error: string | null }> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('site_pages')
    .update({ is_published: publish })
    .eq('id', id)
  return { error: error?.message ?? null }
}

export async function deletePage(id: string): Promise<{ error: string | null }> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('site_pages')
    .delete()
    .eq('id', id)
  return { error: error?.message ?? null }
}
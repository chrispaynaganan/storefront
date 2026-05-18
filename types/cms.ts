// ─────────────────────────────────────────────
// Known & Worn CMS — Type Definitions
// ─────────────────────────────────────────────

// ── Blocks ───────────────────────────────────

export type BlockType = 'image' | 'banner' | 'two_column' | 'spacer'

export interface ImageBlock {
  type: 'image'
  id: string
  image_url: string
  alt: string
  caption?: string
  full_width: boolean
}

export interface BannerBlock {
  type: 'banner'
  id: string
  heading: string
  subheading: string
  cta_text: string
  cta_url: string
  background_color: string // hex
  text_color: 'light' | 'dark'
}

export interface TwoColumnBlock {
  type: 'two_column'
  id: string
  left: {
    heading: string
    body: string
    image_url?: string
  }
  right: {
    heading: string
    body: string
    image_url?: string
  }
}

export interface SpacerBlock {
  type: 'spacer'
  id: string
  size: 'sm' | 'md' | 'lg' | 'xl'
}

export type Block = ImageBlock | BannerBlock | TwoColumnBlock | SpacerBlock

// ── Custom Pages ─────────────────────────────

export interface SitePage {
  id: string
  title: string
  slug: string
  blocks: Block[]
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

// ── Fixed Sections ────────────────────────────

export interface SiteSection {
  id: string
  section_key: string
  label: string
  content: Record<string, unknown>
  updated_at: string
}

// ── Global Settings ───────────────────────────

export interface SiteSettings {
  id: 1
  footer_tagline: string
  facebook_url: string
  email: string
  tiktok_url: string
  shopee_url: string
  lazada_url: string
  updated_at: string
}
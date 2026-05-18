// lib/seo.ts
// Central place for all SEO defaults — import from here, never hardcode

export const SITE_NAME = 'Known & Worn'
export const SITE_URL = 'https://www.knownandworn.com'
export const SITE_DESCRIPTION =
  'Clean, expressive streetwear made in the Philippines. Hoodies, shirts, and sports wear built for everyday wear.'
export const SITE_TWITTER = '@knownandworn' // update when you have one
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg` // place a 1200x630 image here

export const DEFAULT_KEYWORDS = [
  'Filipino streetwear',
  'Philippines apparel',
  'hoodies Philippines',
  'shirts Philippines',
  'Known and Worn',
  'KnownAndWorn',
  'Filipino fashion brand',
  'local clothing brand Philippines',
  'streetwear PH',
]

/** Builds a canonical URL safely */
export function canonical(path: string) {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/** Truncates a string to a safe meta description length */
export function metaDesc(text: string, max = 155) {
  const clean = text.replace(/<[^>]+>/g, '').trim()
  return clean.length <= max ? clean : clean.slice(0, max - 1) + '…'
}

/** Strips HTML tags — used for og:description from rich content */
export function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, '').trim()
}
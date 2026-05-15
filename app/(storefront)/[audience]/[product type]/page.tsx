import { notFound, redirect } from 'next/navigation'
import { CategoryPage } from '@/components/category/CategoryPage'

const AUDIENCES: Record<string, string> = {
  women: "Women's",
  men:   "Men's",
  kids:  "Kids'",
  sports: 'Sports',
}

const PRODUCT_TYPES: Record<string, { label: string; description: string }> = {
  shirts:  { label: 'Shirts',  description: 'Clean, minimal shirts built for everyday wear.' },
  hoodies: { label: 'Hoodies', description: 'Premium heavyweight hoodies. Covered in faith.' },
}

interface Props {
  params: Promise<{ audience: string; productType: string }>
  searchParams: Promise<{ sizes?: string; in_stock?: string; sort?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { audience, productType } = await params
  const audienceLabel = AUDIENCES[audience]
  const typeConfig = PRODUCT_TYPES[productType]
  if (!audienceLabel || !typeConfig) return {}
  return { title: `${audienceLabel} ${typeConfig.label} — Known & Worn` }
}

export default async function AudienceProductTypePage({ params, searchParams }: Props) {
  const { audience, productType } = await params
  const audienceLabel = AUDIENCES[audience]

  // Unknown audience → 404
  if (!audienceLabel) notFound()

  // new-arrivals → redirect to filtered new arrivals page
  if (productType === 'new-arrivals') {
    redirect(`/new-arrivals?audience=${audience}`)
  }

  const typeConfig = PRODUCT_TYPES[productType]

  // Unknown product type → redirect to audience shop instead of 404
  if (!typeConfig) {
    redirect(`/${audience}/shop`)
  }

  return (
    <CategoryPage
      config={{
        audience,
        productType,
        label: `${audienceLabel} ${typeConfig.label}`,
        description: typeConfig.description,
        backLink: { label: audienceLabel, href: `/${audience}` },
        emptyMessage: `${audienceLabel} ${typeConfig.label} coming soon.`,
        emptySubmessage: `We're working on it. Browse all ${audienceLabel.toLowerCase()} products in the meantime.`,
      }}
      searchParams={await searchParams}
    />
  )
}
import { notFound } from 'next/navigation'
import { CategoryPage } from '@/components/category/CategoryPage'

const AUDIENCES: Record<string, { label: string; description: string }> = {
  women: { label: "Women's",  description: 'All women\'s products — shirts, hoodies, and more.' },
  men:   { label: "Men's",    description: 'All men\'s products — shirts, hoodies, and more.' },
  kids:  { label: "Kids'",    description: 'All kids\' products — shirts, hoodies, and more.' },
  sports:{ label: 'Sports',   description: 'All sports products — built for movement.' },
}

interface Props {
  params: Promise<{ audience: string }>
  searchParams: Promise<{ sizes?: string; in_stock?: string; sort?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { audience } = await params
  const config = AUDIENCES[audience]
  if (!config) return {}
  return { title: `${config.label} — Known & Worn` }
}

export default async function AudienceShopPage({ params, searchParams }: Props) {
  const { audience } = await params
  const config = AUDIENCES[audience]
  if (!config) notFound()

  return (
    <CategoryPage
      config={{
        audience,
        label: `${config.label} — All Products`,
        description: config.description,
        backLink: { label: config.label, href: `/${audience}` },
      }}
      searchParams={await searchParams}
    />
  )
}
import { CategoryPage } from '@/components/category/CategoryPage'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'New Arrivals — Known & Worn' }

interface Props {
  searchParams: Promise<{ audience?: string; sizes?: string; in_stock?: string; sort?: string }>
}

export default async function NewArrivalsPage({ searchParams }: Props) {
  const { audience, ...rest } = await searchParams
  return (
    <CategoryPage
      config={{
        label: 'New Arrivals',
        description: 'The latest pieces — fresh drops updated regularly.',
        audience: audience,
        emptyMessage: 'No new arrivals yet.',
        emptySubmessage: 'Check back soon — new pieces are dropping shortly.',
        emptyHref: '/shop',
        emptyActionLabel: 'Browse all products',
      }}
      searchParams={rest}
      newArrivalsOnly
    />
  )
}
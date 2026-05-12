import { CategoryPage } from '@/components/category/CategoryPage'

export const metadata = { title: 'Sports — Known & Worn' }

interface Props {
  searchParams: Promise<{ sizes?: string; in_stock?: string; sort?: string }>
}

export default async function SportsPage({ searchParams }: Props) {
  return (
    <CategoryPage
      config={{
        slug: 'sports',
        label: 'Sports',
        description: 'Performance-ready pieces for an active lifestyle.',
      }}
      searchParams={await searchParams}
    />
  )
}
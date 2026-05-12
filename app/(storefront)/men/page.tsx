import { CategoryPage } from '@/components/category/CategoryPage'

export const metadata = { title: 'Men — Known & Worn' }

interface Props {
  searchParams: Promise<{ sizes?: string; in_stock?: string; sort?: string }>
}

export default async function MenPage({ searchParams }: Props) {
  return (
    <CategoryPage
      config={{
        slug: 'men',
        label: 'Men',
        description: 'Clean cuts and comfortable fits for him.',
      }}
      searchParams={await searchParams}
    />
  )
}
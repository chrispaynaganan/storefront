import { CategoryPage } from '@/components/category/CategoryPage'

export const metadata = { title: 'Women — Known & Worn' }

interface Props {
  searchParams: Promise<{ sizes?: string; in_stock?: string; sort?: string }>
}

export default async function WomenPage({ searchParams }: Props) {
  return (
    <CategoryPage
      config={{
        slug: 'women',
        label: 'Women',
        description: 'Everyday essentials designed for her.',
      }}
      searchParams={await searchParams}
    />
  )
}
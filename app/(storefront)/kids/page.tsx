import { CategoryPage } from '@/components/category/CategoryPage'

export const metadata = { title: 'Kids — Known & Worn' }

interface Props {
  searchParams: Promise<{ sizes?: string; in_stock?: string; sort?: string }>
}

export default async function KidsPage({ searchParams }: Props) {
  return (
    <CategoryPage
      config={{
        slug: 'kids',
        label: 'Kids',
        description: 'Soft, durable styles built for little ones.',
      }}
      searchParams={await searchParams}
    />
  )
}
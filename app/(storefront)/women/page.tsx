import { AudienceLandingPage } from '@/components/category/AudienceLandingPage'

export const metadata = { title: "Women's — Known & Worn" }

export default function WomenPage() {
  return (
    <AudienceLandingPage config={{
      audience: 'women',
      label: 'Women',
      tagline: 'Made for her',
      description: 'Everyday essentials designed for her. Clean fits, premium fabrics, built to last.',
    }} />
  )
}
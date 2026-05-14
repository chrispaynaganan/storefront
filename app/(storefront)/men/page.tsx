import { AudienceLandingPage } from '@/components/category/AudienceLandingPage'

export const metadata = { title: "Men's — Known & Worn" }

export default function MenPage() {
  return (
    <AudienceLandingPage config={{
      audience: 'men',
      label: 'Men',
      tagline: 'Built for everyday',
      description: 'Clean, minimal pieces built for everyday wear. Heavyweight fabrics, honest fits.',
    }} />
  )
}
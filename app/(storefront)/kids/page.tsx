import { AudienceLandingPage } from '@/components/category/AudienceLandingPage'

export const metadata = { title: "Kids' — Known & Worn" }

export default function KidsPage() {
  return (
    <AudienceLandingPage config={{
      audience: 'kids',
      label: 'Kids',
      tagline: 'Small fits, big heart',
      description: 'The same quality, sized for the little ones. Soft, durable, and made to move.',
    }} />
  )
}
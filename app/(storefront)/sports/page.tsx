import { AudienceLandingPage } from '@/components/category/AudienceLandingPage'

export const metadata = { title: 'Sports — Known & Worn' }

export default function SportsPage() {
  return (
    <AudienceLandingPage config={{
      audience: 'sports',
      label: 'Sports',
      tagline: 'Move by faith',
      description: 'Performance-ready pieces that carry the message. Built for movement, worn with intention.',
    }} />
  )
}
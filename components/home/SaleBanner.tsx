import Link from 'next/link'

interface Props {
  isActive: boolean
}

export function SaleBanner({ isActive }: Props) {
  if (!isActive) return null

  return (
    <div className="bg-brown text-whitewash py-3 px-4 text-center">
      <p className="text-sm font-medium">
        Sale is on —{' '}
        <Link
          href="/sale"
          className="underline underline-offset-2 hover:text-peach transition-colors"
        >
          Shop discounted items
        </Link>
      </p>
    </div>
  )
}
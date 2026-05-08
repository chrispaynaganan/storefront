interface Props { label?: string }

export function ProductBadge({ label = 'Bestseller' }: Props) {
  return (
    <span className="inline-block bg-peach text-brown text-xs font-medium px-2.5 py-1 rounded-full">
      {label}
    </span>
  )
}

interface Props { page: number; total: number; perPage: number; onPageChange: (p: number) => void }

export function Pagination({ page, total, perPage, onPageChange }: Props) {
  const pages = Math.ceil(total / perPage)
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-8 h-8 rounded-full text-sm transition-colors ${p === page ? 'bg-brown text-white' : 'text-brown-light hover:text-brown'}`}
        >
          {p}
        </button>
      ))}
    </div>
  )
}

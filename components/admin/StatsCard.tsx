interface Props { label: string; value: string | number; change?: string }

export function StatsCard({ label, value, change }: Props) {
  return (
    <div className="bg-white rounded-xl border border-peach-light p-5">
      <p className="text-xs text-brown-light uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-light text-brown">{value}</p>
      {change && <p className="text-xs text-green-600 mt-1">{change}</p>}
    </div>
  )
}

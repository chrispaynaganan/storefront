import { cn } from '@/lib/utils'

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export function Select({ label, options, className, ...props }: Props) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm text-brown mb-1.5">{label}</label>}
      <select
        className={cn(
          'w-full px-4 py-2.5 rounded-lg border border-peach bg-white text-sm text-brown',
          'focus:outline-none focus:ring-2 focus:ring-peach',
          className
        )}
        {...props}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

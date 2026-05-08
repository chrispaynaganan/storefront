import { cn } from '@/lib/utils'

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, ...props }: Props) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm text-brown mb-1.5">{label}</label>}
      <textarea
        rows={4}
        className={cn(
          'w-full px-4 py-2.5 rounded-lg border border-peach bg-white text-sm text-brown placeholder:text-brown-light/50',
          'focus:outline-none focus:ring-2 focus:ring-peach resize-none',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

import { cn } from '@/lib/utils'

interface Props {
  children: React.ReactNode
  variant?: 'peach' | 'brown' | 'success' | 'warning' | 'danger'
  className?: string
}

export function Badge({ children, variant = 'peach', className }: Props) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      {
        'bg-peach text-brown': variant === 'peach',
        'bg-brown text-white': variant === 'brown',
        'bg-green-100 text-green-800': variant === 'success',
        'bg-yellow-100 text-yellow-800': variant === 'warning',
        'bg-red-100 text-red-800': variant === 'danger',
      },
      className
    )}>
      {children}
    </span>
  )
}

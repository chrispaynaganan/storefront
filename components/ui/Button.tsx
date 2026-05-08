import { cn } from '@/lib/utils'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ className, variant = 'primary', size = 'md', children, ...props }: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        {
          'bg-brown text-white hover:bg-brown-light': variant === 'primary',
          'border border-brown text-brown hover:bg-peach-light': variant === 'outline',
          'text-brown-light hover:text-brown': variant === 'ghost',
          'text-xs px-3 py-1.5': size === 'sm',
          'text-sm px-5 py-2.5': size === 'md',
          'text-base px-6 py-3': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

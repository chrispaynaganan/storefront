import { cn } from '@/lib/utils'

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div style={style} className={cn('bg-whitewash-off animate-pulse rounded-2xl', className)} />
}
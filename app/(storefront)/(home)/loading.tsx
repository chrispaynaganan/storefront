import { Skeleton } from '@/components/ui/Skeleton'

export default function HomeLoading() {
  return (
    <div>
      <Skeleton className="w-full rounded-none" style={{ minHeight: 'clamp(400px, 60vw, 680px)' }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-7 w-40 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-3/4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Skeleton className="h-7 w-36 mb-6" />
        <div className="flex gap-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="aspect-square w-48 shrink-0" />
          ))}
        </div>
      </div>
    </div>
  )
}
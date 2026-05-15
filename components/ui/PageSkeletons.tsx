import { Skeleton } from './Skeleton'

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="aspect-3/4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  )
}

export function CategoryPageSkeleton() {
  return (
    <div>
      <Skeleton className="w-full rounded-none" style={{ minHeight: 'clamp(260px, 35vw, 420px)' }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8">
          <div className="hidden md:flex flex-col gap-3 w-48 shrink-0">
            <Skeleton className="h-5 w-20" />
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
          </div>
          <div className="flex-1">
            <ProductGridSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 flex flex-col gap-3">
          <Skeleton className="aspect-3/4 w-full" />
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-square w-16" />)}
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-4 pt-2">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-5 w-1/4" />
          <div className="flex gap-2 mt-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-14" />)}
          </div>
          <Skeleton className="h-12 w-full mt-2" />
          <div className="flex flex-col gap-2 mt-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
          </div>
        </div>
      </div>
    </div>
  )
}

export function CollectionsPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Skeleton className="h-10 w-48 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function LookbookPageSkeleton() {
  return (
    <div>
      <Skeleton className="w-full rounded-none h-44" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton
              key={i}
              className="break-inside-avoid w-full"
              style={{ aspectRatio: i % 3 === 2 ? '4/3' : '3/4' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function JournalPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Skeleton className="h-10 w-40 mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-1/3 mt-1" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function JournalPostSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Skeleton className="h-4 w-24 mb-6" />
      <Skeleton className="h-10 w-4/5 mb-3" />
      <Skeleton className="h-10 w-2/3 mb-6" />
      <Skeleton className="aspect-video w-full mb-10" />
      <div className="flex flex-col gap-3">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className={`h-4 ${i % 4 === 3 ? 'w-2/3' : 'w-full'}`} />
        ))}
      </div>
    </div>
  )
}

export function CartPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Skeleton className="h-9 w-32 mb-8" />
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="w-24 h-28 shrink-0" />
              <div className="flex-1 flex flex-col gap-2 pt-1">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-8 w-24 mt-2" />
              </div>
            </div>
          ))}
        </div>
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-3">
          <Skeleton className="h-6 w-32" />
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
          <Skeleton className="h-12 w-full mt-2" />
        </div>
      </div>
    </div>
  )
}

export function WishlistPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Skeleton className="h-9 w-32 mb-8" />
      <ProductGridSkeleton count={6} />
    </div>
  )
}

export function AccountPageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Skeleton className="h-9 w-40 mb-8" />
      <div className="flex flex-col gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
        <Skeleton className="h-12 w-full mt-2" />
      </div>
    </div>
  )
}
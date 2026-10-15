import { Skeleton } from '@components/ui/skeleton'

export function RowsSkeleton({
  label = 'Loading data',
  rows = 3
}: {
  label?: string
  rows?: number
}) {
  return (
    <div role="status" aria-label={label} className="space-y-4">
      <span className="sr-only">{label}…</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} aria-hidden="true" className="flex items-center gap-4">
          <Skeleton className="size-10 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  )
}

function CardSkeleton({
  className = '',
  rows = 3
}: {
  className?: string
  rows?: number
}) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-lg border bg-card p-6 space-y-6 ${className}`}
    >
      <Skeleton className="h-6 w-40 max-w-full" />
      <RowsSkeleton rows={rows} />
    </div>
  )
}

export function PageSkeleton({
  kind = 'dashboard'
}: {
  kind?: 'dashboard' | 'list' | 'detail' | 'profile' | 'form'
}) {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="col-span-2 grid grid-cols-2 gap-4 xl:col-span-4 xl:grid-cols-4"
    >
      <span className="sr-only">Loading page…</span>
      {kind === 'dashboard' ? (
        <>
          <CardSkeleton className="col-span-2 xl:col-span-4" rows={1} />
          <CardSkeleton className="col-span-2 xl:col-span-1" />
          <CardSkeleton className="col-span-2 xl:col-span-3" rows={4} />
          <CardSkeleton className="col-span-2 xl:col-span-1" rows={2} />
          <CardSkeleton className="col-span-2 xl:col-span-3" />
          <CardSkeleton className="col-span-2 xl:col-span-4" rows={5} />
        </>
      ) : kind === 'form' ? (
        <div aria-hidden="true" className="col-span-2 space-y-6 xl:col-span-4">
          <Skeleton className="h-8 w-48" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <Skeleton className="ml-auto h-10 w-24" />
        </div>
      ) : (
        <>
          <div
            aria-hidden="true"
            className="col-span-2 space-y-4 py-4 xl:col-span-4"
          >
            <Skeleton
              className={
                kind === 'profile' ? 'size-20 rounded-full' : 'h-10 w-2/3'
              }
            />
            <Skeleton className="h-6 w-1/3" />
          </div>
          <CardSkeleton
            className="col-span-2 xl:col-span-4"
            rows={kind === 'detail' ? 2 : 5}
          />
          {kind === 'detail' && (
            <CardSkeleton className="col-span-2" rows={4} />
          )}
        </>
      )}
    </div>
  )
}

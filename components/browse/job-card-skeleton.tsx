export function JobCardSkeleton() {
  return (
    <div className="rounded-card border border-border bg-surface p-card" aria-hidden="true">
      <div className="flex items-start justify-between gap-3">
        <div className="w-full space-y-2">
          <div className="h-5 w-2/3 animate-pulse rounded bg-surface-hover" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-surface-hover" />
        </div>
        <div className="h-8 w-16 animate-pulse rounded-full bg-surface-hover" />
      </div>
      <div className="mt-4 flex gap-3">
        <div className="h-4 w-20 animate-pulse rounded bg-surface-hover" />
        <div className="h-4 w-24 animate-pulse rounded bg-surface-hover" />
        <div className="ml-auto h-4 w-12 animate-pulse rounded bg-surface-hover" />
      </div>
    </div>
  )
}

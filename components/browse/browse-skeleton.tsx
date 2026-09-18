import { JobCardSkeleton } from './job-card-skeleton'

export function BrowseSkeleton() {
  return (
    <div className="space-y-section" aria-busy="true" aria-label="Loading jobs">
      <div className="h-12 animate-pulse rounded-card bg-surface-hover" />
      <div className="h-10 w-72 animate-pulse rounded-card bg-surface-hover" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => (
          <JobCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}

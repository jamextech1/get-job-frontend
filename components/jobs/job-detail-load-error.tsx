import { RetryRefreshButton } from './retry-refresh-button'

export function JobDetailLoadError() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div role="alert" className="rounded-card border border-border bg-surface p-8 text-center">
        <p className="font-medium text-ink">We couldn&apos;t load this job.</p>
        <p className="mt-1 text-sm text-muted">
          The job service is unreachable. Check your connection and try again.
        </p>
        <RetryRefreshButton label="Try again" />
      </div>
    </main>
  )
}

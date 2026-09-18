'use client'

export default function JobDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div
        role="alert"
        className="rounded-card border border-border bg-surface p-8 text-center"
      >
        <p className="font-medium text-ink">We couldn&apos;t load this job.</p>
        <p className="mt-1 text-sm text-muted">
          The job service is unreachable. Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-card bg-accent px-4 py-2 font-medium text-on-accent hover:bg-accent-hover"
        >
          Try again
        </button>
        {error.digest && <p className="mt-3 text-xs text-muted">Ref: {error.digest}</p>}
      </div>
    </main>
  )
}

'use client'

import { useRouter } from 'next/navigation'

export function MeLoadError() {
  const router = useRouter()
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
      <div role="alert" className="rounded-card border border-border bg-surface p-8 text-center">
        <p className="font-medium text-ink">We couldn&apos;t load your saved jobs.</p>
        <p className="mt-1 text-sm text-muted">
          The job service is unreachable. Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="mt-4 rounded-card bg-accent px-4 py-2 font-medium text-on-accent hover:bg-accent-hover"
        >
          Try again
        </button>
      </div>
    </main>
  )
}

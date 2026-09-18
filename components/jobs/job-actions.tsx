'use client'

import { useAuth } from '@/components/auth/auth-provider'

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="size-4"
    >
      <path d="M6 4h12v16l-6-4-6 4z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="size-4"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="size-3.5"
    >
      <path d="M7 17L17 7" />
      <path d="M9 7h8v8" />
    </svg>
  )
}

export function JobActions({
  job,
}: {
  job: { id: string; title: string; companyName: string; applyUrl: string }
}) {
  const { savedJobIds, appliedJobIds, busyJobIds, saveJob, unsaveJob, applyToJob } = useAuth()
  const isSaved = savedJobIds.has(job.id)
  const isApplied = appliedJobIds.has(job.id)
  const isBusy = busyJobIds.has(job.id)

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      {isApplied ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-sm font-medium text-success">
          <CheckIcon />
          Applied
        </span>
      ) : (
        <button
          type="button"
          onClick={() => void applyToJob({ jobId: job.id, applyUrl: job.applyUrl })}
          disabled={isBusy}
          aria-label={`Apply for ${job.title} at ${job.companyName}`}
          className="rounded-card bg-accent px-5 py-2.5 font-medium text-on-accent hover:bg-accent-hover disabled:opacity-60"
        >
          Apply
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          if (isSaved) {
            void unsaveJob(job.id)
          } else {
            void saveJob(job.id)
          }
        }}
        aria-pressed={isSaved}
        aria-label={
          isSaved
            ? `Remove ${job.title} at ${job.companyName} from saved jobs`
            : `Save ${job.title} at ${job.companyName}`
        }
        disabled={isBusy}
        className={
          isSaved
            ? 'inline-flex items-center gap-1.5 rounded-card border border-transparent bg-accent-soft px-4 py-2.5 font-medium text-accent hover:bg-surface-hover disabled:opacity-60'
            : 'inline-flex items-center gap-1.5 rounded-card border border-border bg-surface px-4 py-2.5 font-medium text-ink hover:bg-surface-hover disabled:opacity-60'
        }
      >
        <BookmarkIcon filled={isSaved} />
        {isSaved ? 'Saved' : 'Save'}
      </button>
      <a
        href={job.applyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-accent underline underline-offset-4 hover:text-accent-hover"
      >
        View original posting
        <ExternalIcon />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    </div>
  )
}

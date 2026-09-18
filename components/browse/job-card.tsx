'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import type { JobListItem } from '@/lib/types'
import { formatRelativeTime } from '@/lib/relative-time'

function formatSalary(job: JobListItem): string | null {
  const currency = job.currency && job.currency !== 'USD' ? `${job.currency} ` : '$'
  if (job.salaryMin != null && job.salaryMax != null) {
    return `${currency}${Math.round(job.salaryMin / 1000)}k – ${currency}${Math.round(job.salaryMax / 1000)}k`
  }
  if (job.salaryMin != null) return `from ${currency}${Math.round(job.salaryMin / 1000)}k`
  if (job.salaryMax != null) return `up to ${currency}${Math.round(job.salaryMax / 1000)}k`
  return null
}

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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className="size-4">
      <path d="M5 13l4 4L19 7" />
    </svg>
  )
}

export function JobCard({
  job,
  isSaved,
  isApplied,
  isBusy,
  onToggleSave,
}: {
  job: JobListItem
  isSaved: boolean
  isApplied: boolean
  isBusy: boolean
  onToggleSave: (jobId: string, saved: boolean) => void
}) {
  const salary = formatSalary(job)
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="rounded-card border border-border bg-surface p-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold leading-snug">
            <Link
              href={`/jobs/${job.slug}`}
              className="text-ink underline-offset-4 hover:text-accent hover:underline"
            >
              {job.title}
            </Link>
          </h2>
          <p className="mt-0.5 text-sm text-muted">{job.company.name}</p>
        </div>
        {isApplied ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-sm font-medium text-success">
            <CheckIcon />
            Applied
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onToggleSave(job.id, isSaved)}
            aria-pressed={isSaved}
            aria-label={
              isSaved
                ? `Remove ${job.title} at ${job.company.name} from saved jobs`
                : `Save ${job.title} at ${job.company.name}`
            }
            disabled={isBusy}
            className={
              isSaved
                ? 'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-transparent bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent hover:bg-surface-hover disabled:opacity-60'
                : 'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-ink hover:bg-surface-hover disabled:opacity-60'
            }
          >
            <BookmarkIcon filled={isSaved} />
            {isSaved ? 'Saved' : 'Save'}
          </button>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted">
        {job.isRemote && (
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
            Remote
          </span>
        )}
        {job.location && <span>{job.location}</span>}
        {salary && <span>{salary}</span>}
        <span className="ml-auto whitespace-nowrap">{formatRelativeTime(job.detectedAt)}</span>
      </div>
    </motion.article>
  )
}

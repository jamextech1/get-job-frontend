'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ApplicationEntry, JobListItem, MeProfile, SavedJobEntry } from '@/lib/types'
import { useAuth } from '@/components/auth/auth-provider'
import { formatAbsoluteDate, formatRelativeTime } from '@/lib/relative-time'

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

function sortBySavedAtDesc(entries: readonly SavedJobEntry[]): SavedJobEntry[] {
  return [...entries].sort((a, b) => b.savedAt.localeCompare(a.savedAt))
}

function sortByAppliedAtDesc(entries: readonly ApplicationEntry[]): ApplicationEntry[] {
  return [...entries].sort((a, b) => b.appliedAt.localeCompare(a.appliedAt))
}

function actionDate(isoDate: string): string {
  const relative = formatRelativeTime(isoDate)
  const absolute = formatAbsoluteDate(isoDate)
  if (relative === '') return absolute
  if (absolute === '') return relative
  return `${relative} (${absolute})`
}

function JobEntryMeta({ job }: { job: JobListItem }) {
  const salary =
    job.salaryMin != null && job.salaryMax != null
      ? `$${Math.round(job.salaryMin / 1000)}k – $${Math.round(job.salaryMax / 1000)}k`
      : null
  return (
    <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-muted">
      {job.isRemote && (
        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
          Remote
        </span>
      )}
      {job.location && <span>{job.location}</span>}
      {salary && <span>{salary}</span>}
    </p>
  )
}

export function MeView({ profile, digestOff }: { profile: MeProfile; digestOff: boolean }) {
  const router = useRouter()
  const { unsaveJob, updateDigestOptIn, signOut } = useAuth()
  const [savedJobs, setSavedJobs] = useState<readonly SavedJobEntry[]>(() =>
    sortBySavedAtDesc(profile.savedJobs),
  )
  const [digestOptIn, setDigestOptIn] = useState(profile.digestOptIn)
  const [digestBusy, setDigestBusy] = useState(false)
  const [unsaveBusyJobIds, setUnsaveBusyJobIds] = useState<ReadonlySet<string>>(new Set())
  const digestConfirmRef = useRef<HTMLDivElement>(null)
  const showDigestConfirm = digestOff && digestOptIn

  const applications = useMemo(() => sortByAppliedAtDesc(profile.applications), [profile.applications])

  const email = profile.email

  useEffect(() => {
    setSavedJobs(sortBySavedAtDesc(profile.savedJobs))
    setDigestOptIn(profile.digestOptIn)
  }, [profile.savedJobs, profile.digestOptIn])

  useEffect(() => {
    if (showDigestConfirm) digestConfirmRef.current?.focus()
  }, [showDigestConfirm])

  async function handleUnsave(jobId: string) {
    if (unsaveBusyJobIds.has(jobId)) return
    setUnsaveBusyJobIds(prev => new Set(prev).add(jobId))
    const ok = await unsaveJob(jobId)
    setUnsaveBusyJobIds(prev => {
      const next = new Set(prev)
      next.delete(jobId)
      return next
    })
    if (ok) {
      setSavedJobs(prev => prev.filter(entry => entry.job.id !== jobId))
    }
  }

  async function handleDigestChange(value: boolean): Promise<boolean> {
    if (digestBusy) return false
    setDigestBusy(true)
    const ok = await updateDigestOptIn(value)
    setDigestBusy(false)
    if (ok) setDigestOptIn(value)
    return ok
  }

  async function handleConfirmDigestOff() {
    const ok = await handleDigestChange(false)
    if (ok) router.replace('/me')
  }

  async function handleSignOut() {
    await signOut()
    router.refresh()
  }

  const savedList = useMemo(
    () =>
      savedJobs.map(entry => (
        <li
          key={entry.job.id}
          className="rounded-card border border-border bg-surface p-card"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold leading-snug">
                <Link
                  href={`/jobs/${entry.job.slug}`}
                  className="text-ink underline-offset-4 hover:text-accent hover:underline"
                >
                  {entry.job.title}
                </Link>
              </h3>
              <p className="mt-0.5 text-sm text-muted">{entry.job.company.name}</p>
              <JobEntryMeta job={entry.job} />
              <p className="mt-1.5 text-sm text-muted">
                Saved <time dateTime={entry.savedAt}>{actionDate(entry.savedAt)}</time>
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleUnsave(entry.job.id)}
              disabled={unsaveBusyJobIds.has(entry.job.id)}
              aria-label={`Remove ${entry.job.title} at ${entry.job.company.name} from saved jobs`}
              className="shrink-0 rounded-card border border-border bg-surface px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface-hover disabled:opacity-60"
            >
              Unsave
            </button>
          </div>
        </li>
      )),
    [savedJobs, unsaveBusyJobIds],
  )

  const appliedList = useMemo(
    () =>
      applications.map(entry => (
        <li
          key={entry.job.id}
          className="rounded-card border border-border bg-surface p-card"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold leading-snug">
                <Link
                  href={`/jobs/${entry.job.slug}`}
                  className="text-ink underline-offset-4 hover:text-accent hover:underline"
                >
                  {entry.job.title}
                </Link>
              </h3>
              <p className="mt-0.5 text-sm text-muted">{entry.job.company.name}</p>
              <JobEntryMeta job={entry.job} />
              <p className="mt-1.5 text-sm text-muted">
                Applied <time dateTime={entry.appliedAt}>{actionDate(entry.appliedAt)}</time>
              </p>
            </div>
            <a
              href={entry.job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-card border border-border bg-surface px-3 py-1.5 text-sm font-medium text-ink hover:bg-surface-hover"
            >
              View application
              <ExternalIcon />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </li>
      )),
    [applications],
  )

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Your jobs</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">{email}</span>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="text-sm text-muted underline underline-offset-4 hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </header>

      <section
        aria-labelledby="digest-heading"
        className="mt-section rounded-card border border-border bg-surface p-card"
      >
        {showDigestConfirm ? (
          <div
            ref={digestConfirmRef}
            tabIndex={-1}
            aria-labelledby="digest-heading"
            className="rounded-card focus-visible:outline-offset-4"
          >
            <h2 id="digest-heading" className="text-lg font-semibold text-ink">
              Turn off the daily digest?
            </h2>
            <p className="mt-1 text-sm text-muted">
              You followed the &ldquo;Stop these emails&rdquo; link. Confirm below and we&apos;ll
              stop sending the daily digest to {email}.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleConfirmDigestOff()}
                disabled={digestBusy}
                className="rounded-card bg-accent px-4 py-2 font-medium text-on-accent hover:bg-accent-hover disabled:opacity-60"
              >
                {digestBusy ? 'Turning off…' : 'Turn off digest'}
              </button>
              <button
                type="button"
                onClick={() => router.replace('/me')}
                className="rounded-card border border-border bg-surface px-4 py-2 font-medium text-ink hover:bg-surface-hover"
              >
                Keep the digest
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="digest-heading" className="text-lg font-semibold text-ink">
                Daily digest
              </h2>
              <p className="mt-1 text-sm text-muted">
                Get an email with new remote jobs detected in the last 24 hours.
                {digestOptIn ? ' You’re currently receiving it.' : ' It’s currently off.'}
              </p>
            </div>
            <label className="flex shrink-0 items-center gap-2 text-sm font-medium text-ink">
              <input
                type="checkbox"
                checked={digestOptIn}
                disabled={digestBusy}
                onChange={event => void handleDigestChange(event.target.checked)}
                className="size-4 accent-accent"
              />
              {digestBusy ? 'Saving…' : digestOptIn ? 'On' : 'Off'}
            </label>
          </div>
        )}
      </section>

      <section aria-labelledby="saved-jobs-heading" className="mt-section">
        <h2 id="saved-jobs-heading" className="text-lg font-semibold text-ink">
          Saved{' '}
          <span className="text-sm font-normal text-muted">
            ({savedJobs.length} {savedJobs.length === 1 ? 'job' : 'jobs'})
          </span>
        </h2>
        {savedJobs.length === 0 ? (
          <div className="mt-3 rounded-card border border-dashed border-border bg-surface p-6 text-center">
            <p className="font-medium text-ink">No saved jobs yet.</p>
            <p className="mt-1 text-sm text-muted">
              Browse jobs and hit{' '}
              <Link href="/" className="text-accent underline underline-offset-4 hover:text-accent-hover">
                Save
              </Link>{' '}
              on the ones you like.
            </p>
          </div>
        ) : (
          <ul className="mt-3 space-y-4">{savedList}</ul>
        )}
      </section>

      <section aria-labelledby="applied-jobs-heading" className="mt-section">
        <h2 id="applied-jobs-heading" className="text-lg font-semibold text-ink">
          Applied{' '}
          <span className="text-sm font-normal text-muted">
            ({applications.length} {applications.length === 1 ? 'job' : 'jobs'})
          </span>
        </h2>
        {applications.length === 0 ? (
          <div className="mt-3 rounded-card border border-dashed border-border bg-surface p-6 text-center">
            <p className="font-medium text-ink">No applications yet.</p>
            <p className="mt-1 text-sm text-muted">
              Jobs you apply to through get_job show up here.
            </p>
          </div>
        ) : (
          <ul className="mt-3 space-y-4">{appliedList}</ul>
        )}
      </section>
    </main>
  )
}

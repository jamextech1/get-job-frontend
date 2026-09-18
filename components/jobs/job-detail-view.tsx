import Link from 'next/link'
import type { JobDetail } from '@/lib/types'
import { formatAbsoluteDate, formatRelativeTime } from '@/lib/relative-time'
import { JobActions } from './job-actions'

function formatSalary(job: JobDetail): string | null {
  if (job.salaryMin == null && job.salaryMax == null) return null
  const symbol = job.currency && job.currency !== 'USD' ? `${job.currency} ` : '$'
  const format = (value: number) => `${symbol}${value.toLocaleString('en-US')}`
  if (job.salaryMin != null && job.salaryMax != null) {
    return `${format(job.salaryMin)} – ${format(job.salaryMax)}`
  }
  if (job.salaryMin != null) return `from ${format(job.salaryMin)}`
  return `up to ${format(job.salaryMax ?? 0)}`
}

function formatDateTime(isoDate: string): string {
  const relative = formatRelativeTime(isoDate)
  const absolute = formatAbsoluteDate(isoDate)
  if (relative === '') return absolute
  if (absolute === '') return relative
  return `${relative} · ${absolute}`
}

export function JobDetailView({ job, description }: { job: JobDetail; description: string }) {
  const salary = formatSalary(job)
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link href="/" className="text-muted underline-offset-4 hover:text-accent hover:underline">
              Jobs
            </Link>
          </li>
          <li aria-hidden="true" className="text-muted">
            /
          </li>
          <li aria-current="page" className="truncate text-ink">
            {job.title}
          </li>
        </ol>
      </nav>
      <article className="mt-6">
        <header>
          <h1 className="text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl">
            {job.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
            {job.isRemote && (
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                Remote
              </span>
            )}
            <Link
              href={`/?company=${encodeURIComponent(job.company.slug)}`}
              className="font-medium text-ink underline-offset-4 hover:text-accent hover:underline"
            >
              {job.company.name}
            </Link>
            {job.location && <span className="text-muted">{job.location}</span>}
          </div>
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {salary && (
              <div className="flex gap-1.5">
                <dt className="text-muted">Salary</dt>
                <dd className="font-medium text-ink">{salary}</dd>
              </div>
            )}
            {job.postedAt && (
              <div className="flex gap-1.5">
                <dt className="text-muted">Posted</dt>
                <dd className="text-ink">
                  <time dateTime={job.postedAt}>{formatDateTime(job.postedAt)}</time>
                </dd>
              </div>
            )}
            <div className="flex gap-1.5">
              <dt className="text-muted">Detected</dt>
              <dd className="text-ink">
                <time dateTime={job.detectedAt}>{formatDateTime(job.detectedAt)}</time>
              </dd>
            </div>
          </dl>
        </header>
        <JobActions
          job={{
            id: job.id,
            title: job.title,
            companyName: job.company.name,
            applyUrl: job.applyUrl,
          }}
        />
        <section aria-labelledby="job-description-heading" className="mt-8">
          <h2 id="job-description-heading" className="text-lg font-semibold text-ink">
            Description
          </h2>
          {description !== '' ? (
            <div
              className="job-description mt-3"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <div className="mt-3 rounded-card border border-dashed border-border bg-surface p-6">
              <p className="text-ink">No description was provided for this role.</p>
              <p className="mt-1 text-sm text-muted">
                View the{' '}
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline underline-offset-4 hover:text-accent-hover"
                >
                  original posting
                </a>{' '}
                for details.
              </p>
            </div>
          )}
        </section>
      </article>
    </main>
  )
}

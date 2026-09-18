'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MotionConfig } from 'motion/react'
import { fetchJobs } from '@/lib/api'
import type { CompanyItem, JobListItem } from '@/lib/types'
import { useAuth } from '@/components/auth/auth-provider'
import { FilterBar, type JobsFilterState } from './filter-bar'
import { JobCard } from './job-card'
import { JobCardSkeleton } from './job-card-skeleton'

const PAGE_SIZE = 20

const DEFAULT_FILTERS: JobsFilterState = { q: '', remote: false, company: '', sort: 'newest' }

type Phase = 'ready' | 'refreshing' | 'loading-more' | 'error'

export function JobsView({
  backendUrl,
  companies,
  initialCompany,
  initialJobs,
  initialNextCursor,
  initialTotal,
  initialError,
}: {
  backendUrl: string
  companies: CompanyItem[]
  initialCompany: string
  initialJobs: JobListItem[]
  initialNextCursor: string | null
  initialTotal: number
  initialError: string | null
}) {
  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters] = useState<JobsFilterState>(() =>
    initialCompany === '' ? DEFAULT_FILTERS : { ...DEFAULT_FILTERS, company: initialCompany },
  )
  const [jobs, setJobs] = useState<JobListItem[]>(initialJobs)
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor)
  const [total, setTotal] = useState(initialTotal)
  const [phase, setPhase] = useState<Phase>(initialError ? 'error' : 'ready')
  const [hideApplied, setHideApplied] = useState(false)
  const { savedJobIds, appliedJobIds, busyJobIds, saveJob, unsaveJob } = useAuth()

  const firstFilterRender = useRef(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => (prev.q === searchInput ? prev : { ...prev, q: searchInput }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const loadFirstPage = useCallback(
    async (current: JobsFilterState) => {
      setPhase('refreshing')
      try {
        const response = await fetchJobs(backendUrl, { ...current, limit: PAGE_SIZE })
        setJobs(response.jobs)
        setNextCursor(response.nextCursor ?? null)
        setTotal(response.total)
        setPhase('ready')
      } catch {
        setPhase('error')
      }
    },
    [backendUrl],
  )

  useEffect(() => {
    if (firstFilterRender.current) {
      firstFilterRender.current = false
      return
    }
    void loadFirstPage(filters)
  }, [filters, loadFirstPage])

  const loadMore = useCallback(async () => {
    if (nextCursor === null || phase === 'refreshing' || phase === 'loading-more') return
    setPhase('loading-more')
    try {
      const response = await fetchJobs(backendUrl, {
        ...filters,
        cursor: nextCursor,
        limit: PAGE_SIZE,
      })
      setJobs(prev => [...prev, ...response.jobs])
      setNextCursor(response.nextCursor ?? null)
      setTotal(response.total)
      setPhase('ready')
    } catch {
      setPhase('error')
    }
  }, [backendUrl, filters, nextCursor, phase])

  const handleFiltersChange = useCallback((next: Partial<JobsFilterState>) => {
    setFilters(prev => ({ ...prev, ...next }))
  }, [])

  const handleToggleSave = useCallback(
    (jobId: string, isSaved: boolean) => {
      if (isSaved) {
        void unsaveJob(jobId)
      } else {
        void saveJob(jobId)
      }
    },
    [saveJob, unsaveJob],
  )

  const handleClearFilters = useCallback(() => {
    setSearchInput('')
    setHideApplied(false)
    setFilters(prev => ({ ...DEFAULT_FILTERS, sort: prev.sort }))
  }, [])

  const visibleJobs = useMemo(
    () => (hideApplied ? jobs.filter(job => !appliedJobIds.has(job.id)) : jobs),
    [hideApplied, jobs, appliedJobIds],
  )

  const hiddenCount = jobs.length - visibleJobs.length

  const hasActiveFilters =
    filters.q !== '' || filters.remote || filters.company !== '' || hiddenCount > 0

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-section">
        <FilterBar
          searchInput={searchInput}
          onSearchInput={setSearchInput}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          companies={companies}
          hideApplied={hideApplied}
          onHideAppliedChange={setHideApplied}
          hideAppliedAvailable={appliedJobIds.size > 0}
        />

        {phase === 'refreshing' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <JobCardSkeleton key={index} />
            ))}
          </div>
        ) : phase === 'error' && jobs.length === 0 ? (
          <ErrorState onRetry={() => void loadFirstPage(filters)} />
        ) : visibleJobs.length === 0 && phase !== 'error' ? (
          <EmptyState hasFilters={hasActiveFilters} onClear={handleClearFilters} />
        ) : (
          <>
            {phase === 'error' && (
              <div
                role="alert"
                className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface p-4 text-sm"
              >
                <p className="text-ink">Something went wrong loading more jobs.</p>
                <button
                  type="button"
                  onClick={() => void loadFirstPage(filters)}
                  className="rounded-card bg-accent px-3 py-1.5 font-medium text-on-accent hover:bg-accent-hover"
                >
                  Try again
                </button>
              </div>
            )}
            <p className="text-sm text-muted" aria-live="polite">
              Showing {visibleJobs.length} of {total} {total === 1 ? 'job' : 'jobs'}
              {hiddenCount > 0 ? ` (${hiddenCount} hidden)` : ''}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {visibleJobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={savedJobIds.has(job.id)}
                  isApplied={appliedJobIds.has(job.id)}
                  isBusy={busyJobIds.has(job.id)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
            {nextCursor !== null && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => void loadMore()}
                  disabled={phase === 'loading-more'}
                  className="rounded-card border border-border bg-surface px-5 py-2.5 font-medium text-ink hover:bg-surface-hover disabled:opacity-60"
                >
                  {phase === 'loading-more' ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </MotionConfig>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-card border border-border bg-surface p-8 text-center">
      <p className="font-medium text-ink">We couldn&apos;t load jobs right now.</p>
      <p className="mt-1 text-sm text-muted">
        The job service is unreachable. Check your connection and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-card bg-accent px-4 py-2 font-medium text-on-accent hover:bg-accent-hover"
      >
        Try again
      </button>
    </div>
  )
}

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean
  onClear: () => void
}) {
  return (
    <div className="rounded-card border border-dashed border-border bg-surface p-8 text-center">
      <p className="font-medium text-ink">
        {hasFilters ? 'No jobs match your filters.' : 'No jobs yet.'}
      </p>
      <p className="mt-1 text-sm text-muted">
        {hasFilters
          ? 'Try a different search or clear the filters.'
          : 'New jobs appear as the crawler finds them.'}
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 rounded-card border border-border bg-surface px-4 py-2 font-medium text-ink hover:bg-surface-hover"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}

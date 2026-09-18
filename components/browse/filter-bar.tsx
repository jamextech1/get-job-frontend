'use client'

import type { CompanyItem, SortOrder } from '@/lib/types'

export type JobsFilterState = {
  q: string
  remote: boolean
  company: string
  sort: SortOrder
}

export function FilterBar({
  searchInput,
  onSearchInput,
  filters,
  onFiltersChange,
  companies,
  hideApplied,
  onHideAppliedChange,
  hideAppliedAvailable,
}: {
  searchInput: string
  onSearchInput: (value: string) => void
  filters: JobsFilterState
  onFiltersChange: (next: Partial<JobsFilterState>) => void
  companies: CompanyItem[]
  hideApplied: boolean
  onHideAppliedChange: (value: boolean) => void
  hideAppliedAvailable: boolean
}) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="job-search" className="sr-only">
          Search jobs
        </label>
        <input
          id="job-search"
          type="search"
          value={searchInput}
          onChange={event => onSearchInput(event.target.value)}
          placeholder="Search title, company, or keyword"
          autoComplete="off"
          className="w-full rounded-card border border-border bg-surface px-4 py-2.5 text-base text-ink placeholder:text-muted"
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={filters.remote}
            onChange={event => onFiltersChange({ remote: event.target.checked })}
            className="size-4 accent-accent"
          />
          Remote only
        </label>
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="company-filter" className="text-ink">
            Company
          </label>
          <select
            id="company-filter"
            value={filters.company}
            onChange={event => onFiltersChange({ company: event.target.value })}
            disabled={companies.length === 0}
            className="rounded-card border border-border bg-surface px-3 py-1.5 text-ink"
          >
            {companies.length === 0 ? (
              <option value="">Companies unavailable</option>
            ) : (
              <option value="">All companies</option>
            )}
            {companies.map(company => (
              <option key={company.slug} value={company.slug}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor="sort-order" className="text-ink">
            Sort
          </label>
          <select
            id="sort-order"
            value={filters.sort}
            onChange={event => onFiltersChange({ sort: event.target.value as SortOrder })}
            className="rounded-card border border-border bg-surface px-3 py-1.5 text-ink"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
        <label
          className={
            hideAppliedAvailable
              ? 'flex items-center gap-2 text-sm text-ink'
              : 'flex items-center gap-2 text-sm text-muted'
          }
        >
          <input
            type="checkbox"
            checked={hideApplied && hideAppliedAvailable}
            onChange={event => onHideAppliedChange(event.target.checked)}
            disabled={!hideAppliedAvailable}
            className="size-4 accent-accent"
          />
          Hide applied
        </label>
      </div>
    </div>
  )
}

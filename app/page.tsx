import { Suspense } from 'react'
import { fetchCompaniesRevalidated, fetchJobsRevalidated, getBackendUrl } from '@/lib/api'
import { JobsView } from '@/components/browse/jobs-view'
import { BrowseSkeleton } from '@/components/browse/browse-skeleton'

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default function HomePage({ searchParams }: HomePageProps) {
  const backendUrl = getBackendUrl()
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="sr-only">Browse remote jobs</h1>
      <Suspense fallback={<BrowseSkeleton />}>
        <BrowseData backendUrl={backendUrl} searchParams={searchParams} />
      </Suspense>
    </main>
  )
}

async function BrowseData({
  backendUrl,
  searchParams,
}: {
  backendUrl: string
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const rawCompany = params['company']
  const initialCompany =
    typeof rawCompany === 'string'
      ? rawCompany
      : Array.isArray(rawCompany) && typeof rawCompany[0] === 'string'
        ? rawCompany[0]
        : ''

  const [jobsResult, companiesResult] = await Promise.allSettled([
    fetchJobsRevalidated(backendUrl, { limit: 20, company: initialCompany }),
    fetchCompaniesRevalidated(backendUrl),
  ])

  const jobs = jobsResult.status === 'fulfilled' ? jobsResult.value.jobs : []
  const nextCursor = jobsResult.status === 'fulfilled' ? jobsResult.value.nextCursor ?? null : null
  const total = jobsResult.status === 'fulfilled' ? jobsResult.value.total : 0
  const initialError = jobsResult.status === 'rejected' ? 'Jobs could not be loaded.' : null
  const companies = companiesResult.status === 'fulfilled' ? companiesResult.value : []

  return (
    <JobsView
      backendUrl={backendUrl}
      companies={companies}
      initialCompany={initialCompany}
      initialJobs={jobs}
      initialNextCursor={nextCursor}
      initialTotal={total}
      initialError={initialError}
    />
  )
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchJobDetailRevalidated, getBackendUrl } from '@/lib/api'
import { parseJobIdFromSlug } from '@/lib/slug'
import { buildMetaDescription, htmlToPlainText, sanitizeJobDescription } from '@/lib/sanitize'
import { JobDetailView } from '@/components/jobs/job-detail-view'
import { JobDetailLoadError } from '@/components/jobs/job-detail-load-error'
import type { JobDetail } from '@/lib/types'

type JobDetailPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const jobId = parseJobIdFromSlug(id)
  if (jobId === null) notFound()
  let job: JobDetail | null
  try {
    job = await fetchJobDetailRevalidated(getBackendUrl(), jobId)
  } catch {
    return { title: 'Job details' }
  }
  if (job === null) notFound()
  const title = `${job.title} at ${job.company.name}`
  const plainText = htmlToPlainText(sanitizeJobDescription(job.description ?? ''))
  const description =
    plainText !== ''
      ? buildMetaDescription(plainText)
      : `${title}${job.location ? ` · ${job.location}` : ''}`
  return { title, description }
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params
  const jobId = parseJobIdFromSlug(id)
  if (jobId === null) notFound()
  let job: JobDetail | null
  try {
    job = await fetchJobDetailRevalidated(getBackendUrl(), jobId)
  } catch {
    return <JobDetailLoadError />
  }
  if (job === null) notFound()
  const description = job.description ? sanitizeJobDescription(job.description) : ''
  return <JobDetailView job={job} description={description} />
}

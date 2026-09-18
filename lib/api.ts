import type { CompanyItem, JobDetail, JobsResponse, SortOrder } from './types'

export const DEFAULT_BACKEND_URL = 'http://localhost:4000'

export function getBackendUrl(): string {
  return process.env.BACKEND_URL ?? DEFAULT_BACKEND_URL
}

export type JobsQuery = {
  q?: string
  remote?: boolean
  company?: string
  sort?: SortOrder
  cursor?: string
  limit?: number
}

export function buildJobsUrl(baseUrl: string, query: JobsQuery): string {
  const params = new URLSearchParams()
  if (query.q) params.set('q', query.q)
  if (query.remote) params.set('remote', 'true')
  if (query.company) params.set('company', query.company)
  if (query.sort) params.set('sort', query.sort)
  if (query.cursor) params.set('cursor', query.cursor)
  if (query.limit) params.set('limit', String(query.limit))
  const queryString = params.toString()
  return queryString ? `${baseUrl}/api/jobs?${queryString}` : `${baseUrl}/api/jobs`
}

async function errorFromResponse(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json()
    if (typeof body === 'object' && body !== null && 'error' in body) {
      const envelope = body as { error?: { message?: unknown } }
      if (
        typeof envelope.error === 'object' &&
        envelope.error !== null &&
        typeof envelope.error.message === 'string'
      ) {
        return envelope.error.message
      }
    }
  } catch {}
  return `Request failed (${response.status})`
}

export async function fetchJobs(
  baseUrl: string,
  query: JobsQuery,
  init?: RequestInit,
): Promise<JobsResponse> {
  const response = await fetch(buildJobsUrl(baseUrl, query), init)
  if (!response.ok) {
    throw new Error(await errorFromResponse(response))
  }
  return (await response.json()) as JobsResponse
}

export async function fetchJobsRevalidated(
  baseUrl: string,
  query: JobsQuery,
): Promise<JobsResponse> {
  return fetchJobs(baseUrl, query, { next: { revalidate: 30 } })
}

export async function fetchCompanies(baseUrl: string, init?: RequestInit): Promise<CompanyItem[]> {
  const response = await fetch(`${baseUrl}/api/companies`, init)
  if (!response.ok) {
    throw new Error(await errorFromResponse(response))
  }
  const body: unknown = await response.json()
  if (Array.isArray(body)) {
    return body as CompanyItem[]
  }
  if (typeof body === 'object' && body !== null && 'companies' in body) {
    const wrapped = body as { companies?: unknown }
    if (Array.isArray(wrapped.companies)) {
      return wrapped.companies as CompanyItem[]
    }
  }
  throw new Error('Unexpected /api/companies response shape')
}

export async function fetchCompaniesRevalidated(baseUrl: string): Promise<CompanyItem[]> {
  return fetchCompanies(baseUrl, { next: { revalidate: 30 } })
}

export async function fetchJobDetail(
  baseUrl: string,
  id: string,
  init?: RequestInit,
): Promise<JobDetail | null> {
  const response = await fetch(`${baseUrl}/api/jobs/${encodeURIComponent(id)}`, init)
  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error(await errorFromResponse(response))
  }
  return (await response.json()) as JobDetail
}

export async function fetchJobDetailRevalidated(baseUrl: string, id: string): Promise<JobDetail | null> {
  return fetchJobDetail(baseUrl, id, { next: { revalidate: 30 } })
}

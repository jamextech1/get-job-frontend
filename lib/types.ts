export type CompanyItem = {
  id: string
  name: string
  slug: string
}

export type JobListItem = {
  id: string
  title: string
  slug: string
  company: CompanyItem
  location?: string
  isRemote: boolean
  salaryMin?: number
  salaryMax?: number
  currency?: string
  applyUrl: string
  detectedAt: string
  postedAt?: string
  isRemoteOnly?: boolean
}

export type JobDetail = JobListItem & {
  description?: string
}

export type JobsResponse = {
  jobs: JobListItem[]
  nextCursor?: string
  total: number
}

export type ApiError = {
  code: string
  message: string
}

export type ApiErrorBody = {
  error: ApiError
}

export type SavedJobEntry = {
  job: JobListItem
  savedAt: string
}

export type ApplicationEntry = {
  job: JobListItem
  appliedAt: string
}

export type MeProfile = {
  email: string
  digestOptIn: boolean
  savedJobIds: string[]
  appliedJobIds: string[]
  savedJobs: SavedJobEntry[]
  applications: ApplicationEntry[]
}

export type SortOrder = 'newest' | 'oldest'

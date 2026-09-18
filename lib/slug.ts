export const SLUG_TITLE_MAX_LENGTH = 60
export const ID_MAX_LENGTH = 32

export function slugifyTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_TITLE_MAX_LENGTH)
    .replace(/-+$/g, '')
  return slug === '' ? 'job' : slug
}

export function buildJobSlug(title: string, id: string): string {
  return `${slugifyTitle(title)}-${id}`
}

export function parseJobIdFromSlug(value: string): string | null {
  const lastDash = value.lastIndexOf('-')
  const candidate = lastDash === -1 ? value : value.slice(lastDash + 1)
  if (candidate.length === 0 || candidate.length > ID_MAX_LENGTH) return null
  return /^[a-z0-9]+$/i.test(candidate) ? candidate : null
}

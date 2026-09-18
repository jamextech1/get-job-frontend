import type { MeProfile } from './types'

export type MutationResult = { ok: true } | { ok: false; status: number; message: string }

export type MeFetchResult = { status: number; profile: MeProfile | null }

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

export async function fetchMeProfile(backendUrl: string, token: string): Promise<MeFetchResult> {
  try {
    const response = await fetch(`${backendUrl}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!response.ok) return { status: response.status, profile: null }
    return { status: response.status, profile: (await response.json()) as MeProfile }
  } catch {
    return { status: 0, profile: null }
  }
}

export async function requestSaveJob(
  backendUrl: string,
  token: string,
  jobId: string,
): Promise<MutationResult> {
  try {
    const response = await fetch(`${backendUrl}/api/me/saved-jobs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    })
    if (response.ok) return { ok: true }
    return { ok: false, status: response.status, message: await errorFromResponse(response) }
  } catch {
    return { ok: false, status: 0, message: 'Network error — please try again.' }
  }
}

export async function requestUnsaveJob(
  backendUrl: string,
  token: string,
  jobId: string,
): Promise<MutationResult> {
  try {
    const response = await fetch(
      `${backendUrl}/api/me/saved-jobs/${encodeURIComponent(jobId)}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      },
    )
    if (response.ok) return { ok: true }
    return { ok: false, status: response.status, message: await errorFromResponse(response) }
  } catch {
    return { ok: false, status: 0, message: 'Network error — please try again.' }
  }
}

export async function requestApplyJob(
  backendUrl: string,
  token: string,
  jobId: string,
): Promise<MutationResult> {
  try {
    const response = await fetch(`${backendUrl}/api/me/applications`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    })
    if (response.ok) return { ok: true }
    return { ok: false, status: response.status, message: await errorFromResponse(response) }
  } catch {
    return { ok: false, status: 0, message: 'Network error — please try again.' }
  }
}

export async function requestUpdateDigestOptIn(
  backendUrl: string,
  token: string,
  digestOptIn: boolean,
): Promise<MutationResult> {
  try {
    const response = await fetch(`${backendUrl}/api/me`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ digestOptIn }),
    })
    if (response.ok) return { ok: true }
    return { ok: false, status: response.status, message: await errorFromResponse(response) }
  } catch {
    return { ok: false, status: 0, message: 'Network error — please try again.' }
  }
}

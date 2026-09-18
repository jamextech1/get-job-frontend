import type { Metadata } from 'next'
import { getBackendUrl } from '@/lib/api'
import { getServerAccessToken } from '@/lib/supabase/server'
import { MeView } from '@/components/me/me-view'
import { MeUnauthenticated } from '@/components/me/me-unauthenticated'
import { MeLoadError } from '@/components/me/me-load-error'
import type { MeProfile } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Your jobs',
  robots: { index: false, follow: false },
}

type MePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function MePage({ searchParams }: MePageProps) {
  const params = await searchParams
  const authFailed = params['auth'] === 'failed'
  const digestOff = params['digest'] === 'off'

  const token = await getServerAccessToken()
  let profile: MeProfile | null = null
  let loadFailed = false
  if (token !== null) {
    try {
      const response = await fetch(`${getBackendUrl()}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      })
      if (response.ok) {
        profile = (await response.json()) as MeProfile
      } else if (response.status !== 401) {
        loadFailed = true
      }
    } catch {
      loadFailed = true
    }
  }

  if (loadFailed) {
    return <MeLoadError />
  }
  if (profile === null) {
    return <MeUnauthenticated authFailed={authFailed} />
  }
  return <MeView profile={profile} digestOff={digestOff} />
}

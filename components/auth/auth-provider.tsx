'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { fetchMeProfile, requestApplyJob, requestSaveJob, requestUnsaveJob, requestUpdateDigestOptIn } from '@/lib/me-api'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'
import { useToast } from '@/components/toast/toast-provider'
import { AuthModal } from './auth-modal'

export type AuthStatus = 'loading' | 'authed' | 'unauthed'

type AuthContextValue = {
  status: AuthStatus
  profileError: boolean
  savedJobIds: ReadonlySet<string>
  appliedJobIds: ReadonlySet<string>
  busyJobIds: ReadonlySet<string>
  openSignIn: () => void
  saveJob: (jobId: string) => Promise<void>
  unsaveJob: (jobId: string) => Promise<boolean>
  applyToJob: (job: { jobId: string; applyUrl: string }) => Promise<void>
  updateDigestOptIn: (value: boolean) => Promise<boolean>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const EMPTY_SET: ReadonlySet<string> = new Set<string>()

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === null) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export function AuthProvider({
  backendUrl,
  children,
}: {
  backendUrl: string
  children: React.ReactNode
}) {
  const { push } = useToast()
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [profileError, setProfileError] = useState(false)
  const [savedJobIds, setSavedJobIds] = useState<ReadonlySet<string>>(EMPTY_SET)
  const [appliedJobIds, setAppliedJobIds] = useState<ReadonlySet<string>>(EMPTY_SET)
  const [busyJobIds, setBusyJobIds] = useState<ReadonlySet<string>>(EMPTY_SET)
  const [modalOpen, setModalOpen] = useState(false)
  const inFlight = useRef<ReadonlySet<string>>(EMPTY_SET)
  const loadedUserId = useRef<string | null>(null)

  const loadProfile = useCallback(
    async (token: string) => {
      const result = await fetchMeProfile(backendUrl, token)
      if (result.status === 200 && result.profile !== null) {
        setSavedJobIds(new Set(result.profile.savedJobIds))
        setAppliedJobIds(new Set(result.profile.appliedJobIds))
        setProfileError(false)
      } else {
        setSavedJobIds(EMPTY_SET)
        setAppliedJobIds(EMPTY_SET)
        setProfileError(true)
        push('error', 'Couldn’t load your saved jobs')
      }
    },
    [backendUrl, push],
  )

  useEffect(() => {
    const client = getSupabaseBrowserClient()
    if (client === null) {
      setStatus('unauthed')
      return undefined
    }
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      if (session === null) {
        loadedUserId.current = null
        setStatus('unauthed')
        setSavedJobIds(EMPTY_SET)
        setAppliedJobIds(EMPTY_SET)
        setProfileError(false)
      } else {
        setStatus('authed')
        const userId = session.user?.id
        if (typeof userId === 'string' && loadedUserId.current !== userId) {
          loadedUserId.current = userId
          const token = session.access_token
          window.setTimeout(() => {
            void loadProfile(token)
          }, 0)
        }
      }
    })
    return () => data.subscription.unsubscribe()
  }, [loadProfile])

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const client = getSupabaseBrowserClient()
    if (client === null) return null
    const { data } = await client.auth.getSession()
    return data.session?.access_token ?? null
  }, [])

  const markBusy = useCallback((jobId: string, busy: boolean) => {
    const next = new Set(inFlight.current)
    if (busy) {
      next.add(jobId)
    } else {
      next.delete(jobId)
    }
    inFlight.current = next
    setBusyJobIds(next)
  }, [])

  const markSaved = useCallback((jobId: string, saved: boolean) => {
    setSavedJobIds(prev => {
      const next = new Set(prev)
      if (saved) {
        next.add(jobId)
      } else {
        next.delete(jobId)
      }
      return next
    })
  }, [])

  const markApplied = useCallback((jobId: string) => {
    setAppliedJobIds(prev => {
      if (prev.has(jobId)) return prev
      const next = new Set(prev)
      next.add(jobId)
      return next
    })
  }, [])

  const openSignIn = useCallback(() => {
    setModalOpen(true)
  }, [])

  const saveJob = useCallback(
    async (jobId: string) => {
      if (status !== 'authed' || inFlight.current.has(jobId)) {
        if (status !== 'authed') setModalOpen(true)
        return
      }
      markBusy(jobId, true)
      const token = await getAccessToken()
      if (token === null) {
        markBusy(jobId, false)
        setModalOpen(true)
        return
      }
      const result = await requestSaveJob(backendUrl, token, jobId)
      markBusy(jobId, false)
      if (result.ok || result.status === 409) {
        markSaved(jobId, true)
        push('success', 'Saved')
      } else {
        push('error', result.message)
      }
    },
    [status, backendUrl, getAccessToken, markBusy, markSaved, push],
  )

  const unsaveJob = useCallback(
    async (jobId: string) => {
      if (status !== 'authed') {
        setModalOpen(true)
        return false
      }
      if (inFlight.current.has(jobId)) return false
      markBusy(jobId, true)
      const token = await getAccessToken()
      if (token === null) {
        markBusy(jobId, false)
        setModalOpen(true)
        return false
      }
      const result = await requestUnsaveJob(backendUrl, token, jobId)
      markBusy(jobId, false)
      if (result.ok) {
        markSaved(jobId, false)
        push('success', 'Removed from saved jobs')
        return true
      }
      push('error', result.message)
      return false
    },
    [status, backendUrl, getAccessToken, markBusy, markSaved, push],
  )

  const applyToJob = useCallback(
    async (job: { jobId: string; applyUrl: string }) => {
      if (status !== 'authed' || inFlight.current.has(job.jobId)) {
        if (status !== 'authed') setModalOpen(true)
        return
      }
      markBusy(job.jobId, true)
      const token = await getAccessToken()
      if (token === null) {
        markBusy(job.jobId, false)
        setModalOpen(true)
        return
      }
      const result = await requestApplyJob(backendUrl, token, job.jobId)
      markBusy(job.jobId, false)
      if (result.ok) {
        markApplied(job.jobId)
        push('success', 'Application recorded')
        window.location.assign(job.applyUrl)
      } else if (result.status === 409) {
        markApplied(job.jobId)
        push('error', 'Already applied to this job')
      } else {
        push('error', result.message)
      }
    },
    [status, backendUrl, getAccessToken, markBusy, markApplied, push],
  )

  const updateDigestOptIn = useCallback(
    async (value: boolean) => {
      if (status !== 'authed') {
        setModalOpen(true)
        return false
      }
      const token = await getAccessToken()
      if (token === null) {
        setModalOpen(true)
        return false
      }
      const result = await requestUpdateDigestOptIn(backendUrl, token, value)
      if (result.ok) {
        push('success', value ? 'Daily digest turned on' : 'Daily digest turned off')
        return true
      }
      push('error', result.message)
      return false
    },
    [status, backendUrl, getAccessToken, push],
  )

  const signOut = useCallback(async () => {
    const client = getSupabaseBrowserClient()
    if (client === null) return
    await client.auth.signOut()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      profileError,
      savedJobIds,
      appliedJobIds,
      busyJobIds,
      openSignIn,
      saveJob,
      unsaveJob,
      applyToJob,
      updateDigestOptIn,
      signOut,
    }),
    [
      status,
      profileError,
      savedJobIds,
      appliedJobIds,
      busyJobIds,
      openSignIn,
      saveJob,
      unsaveJob,
      applyToJob,
      updateDigestOptIn,
      signOut,
    ],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </AuthContext.Provider>
  )
}

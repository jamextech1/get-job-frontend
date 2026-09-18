'use client'

import Link from 'next/link'
import { useAuth } from './auth-provider'

export function SavedLink({ initiallyAuthed }: { initiallyAuthed: boolean }) {
  const { status } = useAuth()
  if (status === 'unauthed') return null
  if (status === 'loading' && !initiallyAuthed) return null
  return (
    <Link
      href="/me"
      className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
    >
      Saved
    </Link>
  )
}

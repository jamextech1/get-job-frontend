'use client'

import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/browser'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FormPhase = 'form' | 'submitting' | 'sent'

export function EmailSignInForm({
  emailInputRef,
}: {
  emailInputRef?: RefObject<HTMLInputElement | null>
}) {
  const [email, setEmail] = useState('')
  const [phase, setPhase] = useState<FormPhase>('form')
  const [error, setError] = useState<string | null>(null)
  const sentHeadingRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (phase === 'sent') {
      sentHeadingRef.current?.focus()
    } else if (phase === 'form') {
      emailInputRef?.current?.focus()
    }
  }, [phase, emailInputRef])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (phase === 'submitting') return
    const normalized = email.trim().toLowerCase()
    if (!EMAIL_PATTERN.test(normalized)) {
      setError('Enter a valid email address.')
      return
    }
    const client = getSupabaseBrowserClient()
    if (client === null) {
      setError('Magic links aren’t set up yet. Please try again later.')
      return
    }
    setError(null)
    setPhase('submitting')
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=/me`
    const { error: otpError } = await client.auth.signInWithOtp({
      email: normalized,
      options: { emailRedirectTo },
    })
    if (otpError) {
      if (otpError.status === 429) {
        setError('Too many sign-in requests. Wait a minute, then try again.')
      } else {
        setError('We couldn’t send your magic link. Please try again.')
      }
      setPhase('form')
      return
    }
    setPhase('sent')
  }

  function handleReset() {
    setEmail('')
    setError(null)
    setPhase('form')
  }

  if (phase === 'sent') {
    return (
      <div>
        <p ref={sentHeadingRef} tabIndex={-1} className="rounded-card font-medium text-ink">
          Check your inbox
        </p>
        <p className="mt-1 text-sm text-muted">
          We sent a magic link to <span className="font-medium text-ink">{email}</span>. Click it
          to sign in — you’ll land right back on your jobs.
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="mt-4 text-sm font-medium text-accent underline underline-offset-4 hover:text-accent-hover"
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p className="text-sm text-muted">
        We email you a magic link. No password, no spam — we only use your email to link your
        saved jobs.
      </p>
      <label htmlFor="magic-link-email" className="mt-4 block text-sm font-medium text-ink">
        Email
      </label>
      <input
        ref={emailInputRef}
        id="magic-link-email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        value={email}
        onChange={event => setEmail(event.target.value)}
        aria-invalid={error !== null}
        aria-describedby={error !== null ? 'magic-link-email-error' : undefined}
        required
        className="mt-1.5 w-full rounded-card border border-border bg-surface px-4 py-2.5 text-base text-ink placeholder:text-muted"
      />
      {error !== null && (
        <p id="magic-link-email-error" role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={phase === 'submitting'}
        className="mt-4 w-full rounded-card bg-accent px-4 py-2.5 font-medium text-on-accent hover:bg-accent-hover disabled:opacity-60"
      >
        {phase === 'submitting' ? 'Sending…' : 'Send magic link'}
      </button>
    </form>
  )
}

'use client'

import { EmailSignInForm } from '@/components/auth/email-sign-in-form'

export function MeUnauthenticated({ authFailed }: { authFailed: boolean }) {
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Your saved jobs</h1>
      <p className="mt-2 text-muted">
        Sign in with a magic link to see the jobs you saved and applied to.
      </p>
      {authFailed && (
        <div
          role="alert"
          className="mt-4 rounded-card border border-border bg-surface p-4 text-sm"
        >
          <p className="text-ink">
            That sign-in link didn&apos;t work or has expired. Request a new one below.
          </p>
        </div>
      )}
      <div className="mt-6 rounded-card border border-border bg-surface p-6">
        <EmailSignInForm />
      </div>
    </main>
  )
}

import Link from 'next/link'
import { SavedLink } from './auth/saved-link'
import { ThemeToggle } from './theme-toggle'

export function SiteHeader({ initiallyAuthed }: { initiallyAuthed: boolean }) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-baseline gap-3">
          <Link href="/" className="text-lg font-semibold tracking-tight text-ink">
            Get Job
          </Link>
          <p className="hidden text-sm text-muted sm:block">Remote-first job discovery</p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <SavedLink initiallyAuthed={initiallyAuthed} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

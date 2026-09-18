import Link from 'next/link'

export default function JobNotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6">
      <p className="text-sm font-medium text-accent">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Job not found</h1>
      <p className="mt-2 text-sm text-muted">
        This job may have closed, or the link is incorrect.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-card bg-accent px-4 py-2 font-medium text-on-accent hover:bg-accent-hover"
      >
        Browse all jobs
      </Link>
    </main>
  )
}

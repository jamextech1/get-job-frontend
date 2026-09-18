'use client'

import { useRouter } from 'next/navigation'

export function RetryRefreshButton({ label }: { label: string }) {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="mt-4 rounded-card bg-accent px-4 py-2 font-medium text-on-accent hover:bg-accent-hover"
    >
      {label}
    </button>
  )
}

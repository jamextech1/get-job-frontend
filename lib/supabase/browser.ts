import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let cachedClient: SupabaseClient | null = null

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (typeof window === 'undefined') return null
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null
  if (cachedClient !== null) return cachedClient
  cachedClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  return cachedClient
}

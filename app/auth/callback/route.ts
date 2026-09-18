import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export const runtime = 'nodejs'

function isSafeNextPath(value: string | null): boolean {
  if (typeof value !== 'string' || value.length === 0) return false
  if (!value.startsWith('/') || value.startsWith('//')) return false
  if (value.includes('\\') || value.includes('\n') || value.includes('\r')) return false
  return true
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const rawNext = requestUrl.searchParams.get('next')
  const next = isSafeNextPath(rawNext) ? (rawNext as string) : '/me'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const cookiesToCopy: { name: string; value: string; options: CookieOptions }[] = []

  let succeeded = false
  if (code !== null && supabaseUrl && supabaseAnonKey) {
    const cookieStore = await cookies()
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          } catch {}
          for (const cookie of cookiesToSet) {
            cookiesToCopy.push(cookie)
          }
        },
      },
    })
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    succeeded = error === null
  }

  const destination = succeeded ? next : '/me?auth=failed'
  const response = NextResponse.redirect(new URL(destination, requestUrl.origin))
  for (const { name, value, options } of cookiesToCopy) {
    response.cookies.set(name, value, options)
  }
  response.headers.set('Cache-Control', 'no-store')
  return response
}

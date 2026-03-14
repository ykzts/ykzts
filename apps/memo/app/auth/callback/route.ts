import { createServerClient } from '@ykzts/supabase/server'
import { revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  // Prevent open redirect: ensure next is a safe relative path
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'

  if (code) {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      revalidateTag('auth-user', 'max')
      // After successful login, enable draft mode so the owner can see private memos
      return NextResponse.redirect(
        new URL(`/api/draft?next=${encodeURIComponent(safeNext)}`, request.url)
      )
    }
  }

  // Return the user to an error page with some instructions, preserving next
  const loginErrorUrl = new URL('/login', request.url)
  loginErrorUrl.searchParams.set('error', 'oauth')
  loginErrorUrl.searchParams.set('next', safeNext)
  return NextResponse.redirect(loginErrorUrl)
}

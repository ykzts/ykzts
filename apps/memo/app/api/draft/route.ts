import { createServerClient } from '@ykzts/supabase/server'
import { draftMode } from 'next/headers'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const next = searchParams.get('next') ?? '/'

  // Prevent open redirect: ensure next is a safe relative path
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'

  // Only enable draft mode for authenticated users
  const supabase = await createServerClient()
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  // Treat only "session missing" as unauthenticated; other errors are unexpected
  if (error && error.message !== 'Auth session missing!') {
    throw new Error(`認証情報の取得に失敗しました: ${error.message}`)
  }

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', safeNext)
    return NextResponse.redirect(loginUrl)
  }

  const draft = await draftMode()
  draft.enable()

  return NextResponse.redirect(new URL(safeNext, request.url))
}

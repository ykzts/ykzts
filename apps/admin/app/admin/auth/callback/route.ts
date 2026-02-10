import { revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/admin'

  // Prevent open redirect: ensure next is a safe relative path
  const safeNext =
    next.startsWith('/') && !next.startsWith('//') ? next : '/admin'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      revalidateTag('auth-user', 'private')
      return NextResponse.redirect(new URL(safeNext, request.url))
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(new URL('/admin/login?error=oauth', request.url))
}

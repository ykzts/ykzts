import { createServerClient } from '@supabase/ssr'
import type { Database } from '@ykzts/supabase'
import { type NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return new NextResponse(
      'Supabase environment variables are not configured',
      {
        status: 500
      }
    )
  }

  const response = NextResponse.next({
    request
  })

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        }
      }
    }
  })

  // Refresh session if expired - required for Server Components
  const {
    data: { user }
  } = await supabase.auth.getUser()

  // Protect /admin routes - redirect to /admin/login if not authenticated
  if (
    !user &&
    request.nextUrl.pathname !== '/admin/login' &&
    !request.nextUrl.pathname.startsWith('/admin/auth/callback')
  ) {
    const redirectResponse = NextResponse.redirect(
      new URL('/admin/login', request.url)
    )
    // Copy auth cookies from the original response to preserve token refresh
    for (const cookie of response.cookies.getAll()) {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    }
    return redirectResponse
  }

  // Redirect to /admin if already authenticated and trying to access login page
  if (user && request.nextUrl.pathname === '/admin/login') {
    const redirectResponse = NextResponse.redirect(
      new URL('/admin', request.url)
    )
    // Copy auth cookies from the original response to preserve session
    for (const cookie of response.cookies.getAll()) {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    }
    return redirectResponse
  }

  return response
}

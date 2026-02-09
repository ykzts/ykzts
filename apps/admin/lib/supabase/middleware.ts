import { createServerClient } from '@supabase/ssr'
import type { Database } from '@ykzts/supabase'
import { type NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({
      request
    })
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
  if (!user && request.nextUrl.pathname.startsWith('/admin')) {
    if (request.nextUrl.pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Redirect to /admin if already authenticated and trying to access login page
  if (user && request.nextUrl.pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return response
}

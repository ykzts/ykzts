import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only process paths under /blog/
  if (!pathname.startsWith('/blog/')) {
    return NextResponse.next()
  }

  // Skip API routes and static assets
  if (
    pathname.startsWith('/blog/api/') ||
    pathname.startsWith('/blog/_next/') ||
    pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next()
  }

  // Try to find a post with this path in redirect_from
  if (!supabase) {
    return NextResponse.next()
  }

  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('slug, published_at')
      .contains('redirect_from', [pathname])
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .maybeSingle()

    if (error) {
      console.error('Error querying redirects:', error)
      return NextResponse.next()
    }

    if (posts?.slug && posts.published_at) {
      // Construct canonical URL
      const publishedDate = new Date(posts.published_at)
      const year = String(publishedDate.getUTCFullYear())
      const month = String(publishedDate.getUTCMonth() + 1).padStart(2, '0')
      const day = String(publishedDate.getUTCDate()).padStart(2, '0')

      const canonicalUrl = `/blog/${year}/${month}/${day}/${posts.slug}`

      // 301 redirect to canonical URL
      return NextResponse.redirect(new URL(canonicalUrl, request.url), 301)
    }
  } catch (err) {
    console.error('Middleware error:', err)
  }

  // No redirect found, continue to Next.js routing
  return NextResponse.next()
}

export const config = {
  matcher: '/blog/:path*'
}

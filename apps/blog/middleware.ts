import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

// NOTE: middleware.ts is deprecated in favor of middleware.config.ts in Next.js 16+
// However, middleware.config.ts doesn't support dynamic database queries for redirects.
// We'll continue using middleware.ts until Next.js provides a suitable alternative
// for dynamic redirect logic. When removed, consider moving to:
// 1. Edge Config for fast key-value lookups
// 2. Vercel KV for persistence
// 3. Pre-generated static redirects in vercel.json (if redirect_from becomes static)
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only process paths under /blog/
  if (!pathname.startsWith('/blog/')) {
    return NextResponse.next()
  }

  // Skip API routes, special routes, and static assets
  if (
    pathname.startsWith('/blog/api/') ||
    pathname.startsWith('/blog/_next/') ||
    pathname === '/blog/atom.xml' ||
    pathname === '/blog/sitemap.xml' ||
    pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next()
  }

  // Skip canonical blog URLs (format: /blog/YYYY/MM/DD/slug)
  // These are the expected URL format and don't need redirect lookup
  if (pathname.match(/^\/blog\/\d{4}\/\d{2}\/\d{2}\/.+$/)) {
    return NextResponse.next()
  }

  // Skip blog homepage and pagination pages
  if (pathname === '/blog' || pathname.match(/^\/blog\/page\/\d+$/)) {
    return NextResponse.next()
  }

  // Skip tag pages
  if (pathname.match(/^\/blog\/tags\/.+/)) {
    return NextResponse.next()
  }

  // Try to find a post with this path in redirect_from
  if (!supabase) {
    return NextResponse.next()
  }

  try {
    const { data: post, error } = await supabase
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

    if (post?.slug && post.published_at) {
      // Construct canonical URL
      const publishedDate = new Date(post.published_at)
      const year = String(publishedDate.getUTCFullYear())
      const month = String(publishedDate.getUTCMonth() + 1).padStart(2, '0')
      const day = String(publishedDate.getUTCDate()).padStart(2, '0')

      const canonicalUrl = `/blog/${year}/${month}/${day}/${post.slug}`

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

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

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
  matcher: [
    // Only process non-standard blog paths that might be legacy redirects
    // Excludes: API routes, _next, static files, canonical URLs, standard pages
    '/blog/((?!api|_next|atom\\.xml|sitemap\\.xml|robots\\.txt|page\\/|tags\\/|\\d{4}\\/\\d{2}\\/\\d{2}\\/).+)'
  ]
}

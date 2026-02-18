import { notFound } from 'next/navigation'
import { NextResponse } from 'next/server'
import { getProfile } from '@/lib/supabase'

export const size = {
  height: 256,
  width: 256
}

function isValidAvatarUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!supabaseUrl) {
      return false
    }

    const allowedHost = new URL(supabaseUrl).hostname

    // Only allow HTTPS and validate hostname matches Supabase project
    return parsedUrl.protocol === 'https:' && parsedUrl.hostname === allowedHost
  } catch {
    return false
  }
}

export default async function Icon() {
  const profile = await getProfile()

  if (!profile.avatar_url) {
    notFound()
  }

  // Validate URL to prevent SSRF attacks
  if (!isValidAvatarUrl(profile.avatar_url)) {
    notFound()
  }

  const res = await fetch(profile.avatar_url)

  if (!res.ok) {
    notFound()
  }

  return new NextResponse(res.body, {
    headers: {
      'Content-Type': res.headers.get('Content-Type') ?? 'image/png'
    }
  })
}

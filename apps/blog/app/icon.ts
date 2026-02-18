import { notFound } from 'next/navigation'
import { NextResponse } from 'next/server'
import { getPublisherProfile } from '@/lib/supabase/profiles'

export const size = {
  height: 256,
  width: 256
}
export const contentType = 'image/png'

export default async function Icon() {
  const profile = await getPublisherProfile()

  if (!profile.avatar_url) {
    notFound()
  }

  const res = await fetch(profile.avatar_url)

  if (!res.ok) {
    notFound()
  }

  return new NextResponse(res.body, {
    headers: {
      'Content-Type': res.headers.get('Content-Type') ?? contentType
    }
  })
}

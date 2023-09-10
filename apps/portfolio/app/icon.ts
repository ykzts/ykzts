import { notFound } from 'next/navigation'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export const size = {
  width: 256,
  height: 256
}
export const contentType = 'image/png'

export default async function Icon() {
  const iconURL = new URL(
    'https://www.gravatar.com/avatar/b9025074d487cd0328f1dc816e5ac50a'
  )

  iconURL.searchParams.set('default', '404')
  iconURL.searchParams.set('size', size.width.toString())

  const res = await fetch(iconURL)

  if (!res.ok) {
    notFound()
  }

  return new NextResponse(res.body, {
    headers: {
      'Content-Type': res.headers.get('Content-Type') ?? contentType
    }
  })
}

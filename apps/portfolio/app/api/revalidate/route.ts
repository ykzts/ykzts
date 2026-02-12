import { revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  let tag: unknown

  try {
    const body = await request.json()
    tag = (body as { tag?: unknown }).tag
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
  }

  if (!tag || typeof tag !== 'string') {
    return NextResponse.json({ message: 'Invalid tag' }, { status: 400 })
  }

  revalidateTag(tag, 'max')

  return NextResponse.json({ now: Date.now(), revalidated: true })
}

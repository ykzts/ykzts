import { draftMode } from 'next/headers'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Verify secret token
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const slug = searchParams.get('slug')

  if (!secret || secret !== process.env.DRAFT_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }

  if (!slug) {
    return NextResponse.json(
      { message: 'Missing slug parameter' },
      { status: 400 }
    )
  }

  // Enable draft mode
  const draft = await draftMode()
  draft.enable()

  // Redirect to the post (we'll construct the full date path on the client side)
  // For now, redirect to the blog root with a slug parameter
  return NextResponse.redirect(new URL(`/blog?preview=${slug}`, request.url))
}

import { draftMode } from 'next/headers'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Disable draft mode
  const draft = await draftMode()
  draft.disable()

  // Redirect to the blog homepage
  return NextResponse.redirect(new URL('/blog', request.url))
}

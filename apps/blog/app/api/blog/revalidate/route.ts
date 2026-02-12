import { revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const revalidateRequestSchema = z.object({
  tag: z.string().min(1, 'Tag must not be empty')
})

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 })
  }

  const validation = revalidateRequestSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json(
      { errors: validation.error.errors, message: 'Invalid request body' },
      { status: 400 }
    )
  }

  const { tag } = validation.data

  revalidateTag(tag, 'max')

  return NextResponse.json({ now: Date.now(), revalidated: true })
}

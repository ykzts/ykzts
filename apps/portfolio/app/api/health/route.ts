import { createBrowserClient } from '@ykzts/supabase/client'
import { NextResponse } from 'next/server'

export async function GET() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.json(
      { details: 'supabase: not configured', status: 'error' },
      {
        headers: { 'Cache-Control': 'no-store' },
        status: 503
      }
    )
  }

  const supabase = createBrowserClient()
  const { error } = await supabase.from('posts').select('id').limit(1)

  if (error) {
    return NextResponse.json(
      { details: `supabase: ${error.message}`, status: 'error' },
      {
        headers: { 'Cache-Control': 'no-store' },
        status: 503
      }
    )
  }

  return NextResponse.json(
    { status: 'ok' },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

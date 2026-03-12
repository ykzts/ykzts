import { createServiceRoleClient } from '@ykzts/supabase/service-role'
import { NextResponse } from 'next/server'

export async function GET() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json(
      { details: 'supabase: not configured', status: 'error' },
      {
        headers: { 'Cache-Control': 'no-store' },
        status: 503
      }
    )
  }

  const supabase = createServiceRoleClient()
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

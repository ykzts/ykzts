import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET() {
  if (!supabase) {
    return NextResponse.json(
      { details: 'supabase: not configured', status: 'error' },
      {
        headers: { 'Cache-Control': 'no-store' },
        status: 503
      }
    )
  }

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

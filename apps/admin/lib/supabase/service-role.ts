import { createClient } from '@supabase/supabase-js'
import type { Database } from '@ykzts/supabase'

/**
 * Create a Supabase client with service role privileges
 * This client bypasses Row Level Security (RLS) and should only be used for:
 * - System operations (cron jobs, background tasks)
 * - Admin operations that need to bypass RLS
 *
 * WARNING: Never expose this client to the browser or use it for user-facing operations
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Supabase service role is not properly configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
    )
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

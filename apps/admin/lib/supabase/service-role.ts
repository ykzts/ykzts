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

  if (!supabaseUrl) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is not configured. Set the environment variable.'
    )
  }

  if (!supabaseServiceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not configured. Set the environment variable.'
    )
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

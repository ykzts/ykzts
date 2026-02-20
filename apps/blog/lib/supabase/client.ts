import 'server-only'

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@ykzts/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : null

export const supabaseAdmin =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false
        }
      })
    : null

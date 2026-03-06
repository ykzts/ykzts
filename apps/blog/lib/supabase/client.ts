import 'server-only'

import { createBrowserClient } from '@ykzts/supabase/client'
import { createServiceRoleClient } from '@ykzts/supabase/service-role'

const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createBrowserClient()
    : null

export const supabaseAdmin =
  process.env.NEXT_PUBLIC_SUPABASE_URL && supabaseServiceRoleKey
    ? createServiceRoleClient()
    : null

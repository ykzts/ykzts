import 'server-only'

import { createBrowserClient } from '@ykzts/supabase/client'

export const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createBrowserClient()
    : null

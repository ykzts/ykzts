import { createClient } from '@supabase/supabase-js'
import { cacheTag } from 'next/cache'
import * as z from 'zod'
import type { Database } from './database.types'

// Zod schema for work content (Portable Text format)
const workSchema = z.object({
  content: z.array(z.any()),
  slug: z.string(),
  starts_at: z.string().optional(),
  title: z.string().min(1)
})

const worksSchema = z.array(workSchema)

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create client only if environment variables are set
const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : null

export async function getWorks(): Promise<z.infer<typeof worksSchema>> {
  'use cache'

  cacheTag('works')

  try {
    if (!supabase) {
      console.warn(
        'Supabase is not properly configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
      )
      return []
    }

    const { data, error } = await supabase
      .from('works')
      .select('content, slug, title, starts_at')
      .order('starts_at', { ascending: false })

    if (error) {
      console.warn('Failed to fetch works from Supabase:', error)
      return []
    }

    return worksSchema.parse(data)
  } catch (error) {
    // Only catch fetch/network errors, not validation errors
    if (error instanceof z.ZodError) {
      throw error
    }
    // Return empty array if Supabase is not properly configured
    console.warn('Failed to fetch works from Supabase:', error)
    return []
  }
}

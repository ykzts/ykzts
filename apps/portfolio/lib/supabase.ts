import { createClient } from '@supabase/supabase-js'
import type { Database } from '@ykzts/supabase'
import { cacheTag } from 'next/cache'
import * as z from 'zod'

// Zod schema for social link
const socialLinkSchema = z.object({
  icon: z.string(),
  label: z.string(),
  url: z.string().url()
})

// Zod schema for profile
const profileSchema = z.object({
  email: z.string().email().nullable(),
  name_en: z.string().nullable(),
  name_ja: z.string().nullable(),
  social_links: z.array(socialLinkSchema),
  tagline_en: z.string().nullable(),
  tagline_ja: z.string().nullable(),
  technologies: z.array(z.string())
})

// Zod schema for work content (Portable Text format)
const workSchema = z.object({
  content: z.array(z.any()),
  slug: z.string(),
  starts_at: z.string(),
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

export type Profile = z.infer<typeof profileSchema>
export type SocialLink = z.infer<typeof socialLinkSchema>

export async function getProfile(): Promise<Profile | null> {
  'use cache'

  cacheTag('profile')

  try {
    if (!supabase) {
      console.warn(
        'Supabase is not properly configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
      )
      return null
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(
        'name_en, name_ja, tagline_en, tagline_ja, email, social_links, technologies'
      )
      .limit(1)
      .single()

    if (error) {
      console.warn('Failed to fetch profile from Supabase:', error)
      return null
    }

    if (!data) {
      return null
    }

    return profileSchema.parse(data)
  } catch (error) {
    // Only catch fetch/network errors, not validation errors
    if (error instanceof z.ZodError) {
      console.error('Profile validation error:', error)
      throw error
    }
    // Return null if Supabase is not properly configured
    console.warn('Failed to fetch profile from Supabase:', error)
    return null
  }
}

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

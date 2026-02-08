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
  about: z.string().nullable(),
  email: z.string().email().nullable(),
  name: z.string().nullable(),
  social_links: z.array(socialLinkSchema),
  tagline: z.string().nullable(),
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

    // Fetch profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('name, tagline, about, email')
      .limit(1)
      .single()

    if (profileError) {
      console.warn('Failed to fetch profile from Supabase:', profileError)
      return null
    }

    if (!profileData) {
      return null
    }

    // Fetch social links
    const { data: socialLinksData, error: socialLinksError } = await supabase
      .from('social_links')
      .select('icon, label, url')
      .eq('profile_id', '00000000-0000-0000-0000-000000000001')
      .order('sort_order', { ascending: true })

    if (socialLinksError) {
      console.warn(
        'Failed to fetch social links from Supabase:',
        socialLinksError
      )
    }

    // Fetch technologies
    const { data: technologiesData, error: technologiesError } = await supabase
      .from('technologies')
      .select('name')
      .eq('profile_id', '00000000-0000-0000-0000-000000000001')
      .order('sort_order', { ascending: true })

    if (technologiesError) {
      console.warn(
        'Failed to fetch technologies from Supabase:',
        technologiesError
      )
    }

    // Combine the data
    const combinedData = {
      ...profileData,
      social_links: socialLinksData || [],
      technologies: (technologiesData || []).map((t) => t.name)
    }

    return profileSchema.parse(combinedData)
  } catch (error) {
    // Only catch fetch/network errors, not validation errors
    if (error instanceof z.ZodError) {
      console.error(
        'Profile validation error: Invalid data structure received from Supabase',
        {
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message
          }))
        }
      )
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

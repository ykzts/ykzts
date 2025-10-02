import { createClient } from '@sanity/client'
import { ZodError, z } from 'zod'

const workSchema = z.object({
  content: z.array(z.any()),
  slug: z.string(),
  title: z.string().nonempty()
})
const worksSchema = z.array(workSchema)

const socialLinkSchema = z.object({
  label: z.string().optional(),
  labelJa: z.string().optional(),
  platform: z.string(),
  url: z.string().url()
})

const profileSchema = z.object({
  bio: z.string().optional(),
  bioJa: z.string().optional(),
  email: z.string().email(),
  name: z.string(),
  nameJa: z.string().optional(),
  socialLinks: z.array(socialLinkSchema).optional(),
  tagline: z.string().optional(),
  taglineJa: z.string().optional()
})

const client = createClient({
  apiVersion: '2023-09-14',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  useCdn: true
})

export async function getWorks(): Promise<z.infer<typeof worksSchema>> {
  try {
    const data = await client.fetch<unknown>(`
      *[_type == "work"] | order(startsAt desc){
        content,
        "slug": slug.current,
        title
      }
    `)

    return worksSchema.parse(data)
  } catch (error) {
    // Only catch fetch/network errors, not validation errors
    if (error instanceof ZodError) {
      throw error
    }
    // Return empty array if Sanity is not properly configured
    console.warn('Failed to fetch works from Sanity:', error)
    return []
  }
}

export async function getProfile(): Promise<z.infer<
  typeof profileSchema
> | null> {
  try {
    const data = await client.fetch<unknown>(`
      *[_type == "profile"] | order(_createdAt asc) [0]{
        bio,
        bioJa,
        email,
        name,
        nameJa,
        socialLinks[]{
          label,
          labelJa,
          platform,
          url
        },
        tagline,
        taglineJa
      }
    `)

    if (!data) {
      return null
    }

    return profileSchema.parse(data)
  } catch (error) {
    // Only catch fetch/network errors, not validation errors
    if (error instanceof ZodError) {
      throw error
    }
    // Return null if Sanity is not properly configured
    console.warn('Failed to fetch profile from Sanity:', error)
    return null
  }
}

import { createClient } from '@sanity/client'
import { unstable_cacheTag as cacheTag } from 'next/cache'
import * as z from 'zod'

const workSchema = z.object({
  content: z.array(z.any()),
  slug: z.string(),
  title: z.string().nonempty()
})
const worksSchema = z.array(workSchema)

const client = createClient({
  apiVersion: '2023-09-14',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  useCdn: true
})

export async function getWorks(): Promise<z.infer<typeof worksSchema>> {
  'use cache'

  cacheTag('works')

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
    if (error instanceof z.ZodError) {
      throw error
    }
    // Return empty array if Sanity is not properly configured
    console.warn('Failed to fetch works from Sanity:', error)
    return []
  }
}

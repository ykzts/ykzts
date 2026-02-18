'use server'

import { openai } from '@ai-sdk/openai'
import type { Json } from '@ykzts/supabase'
import { generateText } from 'ai'
import { z } from 'zod'
import { createClient } from './supabase/server'

/**
 * Extract text content from Portable Text JSON
 */
function extractTextFromPortableText(content: Json): string {
  if (!content || typeof content !== 'object') {
    return ''
  }

  const blocks = Array.isArray(content) ? content : [content]
  const texts: string[] = []

  for (const block of blocks) {
    if (
      typeof block === 'object' &&
      block !== null &&
      'children' in block &&
      Array.isArray(block.children)
    ) {
      for (const child of block.children) {
        if (
          typeof child === 'object' &&
          child !== null &&
          'text' in child &&
          typeof child.text === 'string'
        ) {
          texts.push(child.text)
        }
      }
    }
  }

  return texts.join(' ').trim()
}

/**
 * Generate SEO-friendly slug using AI with automatic duplicate checking
 * Uses AI SDK's tool calling feature to check slug availability and retry if needed
 */
export async function generateSlugWithAI(params: {
  title: string
  content: string
  table: 'posts' | 'works'
  excludeId?: string
}): Promise<string> {
  const { title, content, table, excludeId } = params

  // Extract text from content if it's JSON
  let contentText = content
  try {
    const parsedContent = JSON.parse(content) as Json
    contentText = extractTextFromPortableText(parsedContent)
  } catch {
    // If parsing fails, assume it's already plain text
    contentText = content
  }

  // Truncate content to avoid excessive token usage (first 500 chars should be enough)
  const truncatedContent = contentText.slice(0, 500)

  const result = await generateText({
    messages: [
      {
        content:
          'You are a URL slug generator. Generate SEO-friendly URL slugs using only lowercase English letters, numbers, and hyphens. Make the slug concise (3-8 words max), descriptive, and focused on the main topic. For Japanese content, translate key concepts to English. Return ONLY the slug without any explanation.',
        role: 'system'
      },
      {
        content: `Title: ${title}\n\nContent: ${truncatedContent}\n\nGenerate an optimal URL slug for this ${table === 'posts' ? 'blog post' : 'portfolio work'}.`,
        role: 'user'
      }
    ],
    model: openai('gpt-4o-mini'),
    tools: {
      checkSlugAvailability: {
        description:
          'Check if a slug is already in use in the database. You MUST call this tool before returning any slug to ensure uniqueness. If the slug is taken, try a different variation.',
        execute: async ({ slug }) => {
          const supabase = await createClient()
          let query = supabase
            .from(table)
            .select('slug')
            .eq('slug', slug)
            .limit(1)

          if (excludeId) {
            query = query.neq('id', excludeId)
          }

          const { data } = await query.maybeSingle()
          const available = !data
          const exists = !!data

          return {
            available,
            exists,
            message: available
              ? 'This slug is available and can be used.'
              : 'This slug is already taken. Try a different variation (e.g., add a descriptive word, use synonym, or rephrase).'
          }
        },
        inputSchema: z.object({
          slug: z
            .string()
            .describe(
              'The URL slug to check (lowercase, hyphens only, no special characters)'
            )
        })
      }
    }
  })

  // Extract and clean the slug from the response
  const slug = result.text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // Replace invalid chars with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens

  if (!slug) {
    throw new Error('AI failed to generate a valid slug')
  }

  return slug
}

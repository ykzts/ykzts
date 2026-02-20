'use server'

import type { Json } from '@ykzts/supabase'
import { generateText, Output } from 'ai'
import { z } from 'zod'
import { portableTextToMarkdown } from './portable-text-to-markdown'

const tagsSchema = z.object({
  tags: z
    .array(z.string())
    .min(3)
    .max(5)
    .describe(
      'List of 3 to 5 lowercase English tags that describe the post content'
    )
})

/**
 * Generate tag suggestions for a post using AI
 */
export async function generateTagsWithAI(params: {
  content: string
  existingTags: string[]
  title: string
}): Promise<string[]> {
  const { content, existingTags, title } = params

  // Convert PortableText to markdown for better context
  let contentText = content
  try {
    const parsedContent = JSON.parse(content) as Json
    contentText = portableTextToMarkdown(parsedContent)
  } catch {
    // If parsing fails, assume it's already plain text
    contentText = content
  }

  // Truncate content to avoid excessive token usage
  const truncatedContent = contentText.slice(0, 1000)

  const existingTagsSection =
    existingTags.length > 0
      ? `\n\nExisting tags (prefer reusing similar ones): ${existingTags.join(', ')}`
      : ''

  const result = await generateText({
    messages: [
      {
        content:
          'You are a blog post tag generator. Analyze the title and content and suggest 3 to 5 tags. Tags must be lowercase English words or hyphenated phrases (e.g. "javascript", "react", "web-development"). If existing tags are provided, reuse them when they closely match the content.',
        role: 'system'
      },
      {
        content: `Title: ${title}\n\nContent: ${truncatedContent}${existingTagsSection}`,
        role: 'user'
      }
    ],
    model: 'openai/gpt-4o-mini',
    output: Output.object({ schema: tagsSchema })
  })

  return result.output.tags
}

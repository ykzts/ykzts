'use server'

import type { Json } from '@ykzts/supabase'
import { generateText } from 'ai'
import { portableTextToMarkdown } from './portable-text-to-markdown'

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
      ? `\n\n既存のタグ（類似のものがあれば優先して使用してください）:\n${existingTags.join(', ')}`
      : ''

  const result = await generateText({
    messages: [
      {
        content:
          'あなたはブログ記事のタグ生成AIです。タイトルと本文を分析し、3〜5個のタグをJSON配列形式のみで返してください。既存のタグと類似したものがあれば、それを優先してください。タグは簡潔で記事の内容を適切に表すものにしてください。必ずJSON配列のみを返してください。例: ["JavaScript", "React", "TypeScript"]',
        role: 'system'
      },
      {
        content: `タイトル: ${title}\n\n本文: ${truncatedContent}${existingTagsSection}`,
        role: 'user'
      }
    ],
    model: 'openai/gpt-4o-mini'
  })

  try {
    const parsed = JSON.parse(result.text.trim()) as unknown
    if (
      Array.isArray(parsed) &&
      parsed.every((tag) => typeof tag === 'string')
    ) {
      return (parsed as string[]).slice(0, 5)
    }
    console.error(
      'AI tag response is not a valid string array. Received:',
      result.text
    )
  } catch {
    console.error(
      'Failed to parse AI tag response as JSON array. Received:',
      result.text
    )
  }

  return []
}

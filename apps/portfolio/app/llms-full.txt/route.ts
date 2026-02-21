import { portableTextToMarkdown } from '@ykzts/portable-text-utils'
import { buildPostUrl, buildWorkUrl, getLlmsHeaderLines } from '@/lib/llms'
import { getPostsForLlmsFull, getWorks } from '@/lib/supabase'

export async function GET() {
  const [works, posts] = await Promise.all([getWorks(), getPostsForLlmsFull()])

  const sections: string[] = [...getLlmsHeaderLines(), '', '## Works', '']

  for (const work of works) {
    const url = buildWorkUrl(work.slug)
    sections.push(`### [${work.title}](${url})`, '')
    const content = portableTextToMarkdown(work.content)
    if (content) {
      sections.push(content, '')
    }
    sections.push('---', '')
  }

  sections.push('## Articles', '')

  for (const post of posts) {
    const url = buildPostUrl(post.slug, post.published_at)
    sections.push(`### [${post.title}](${url})`, '')
    const content = portableTextToMarkdown(post.content)
    if (content) {
      sections.push(content, '')
    } else if (post.excerpt) {
      sections.push(post.excerpt, '')
    }
    sections.push('---', '')
  }

  return new Response(sections.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  })
}

import { extractFirstParagraph } from '@ykzts/portable-text-utils'
import { buildPostUrl, buildWorkUrl, getLlmsHeaderLines } from '@/lib/llms'
import { getPostsForLlms, getWorks } from '@/lib/supabase'

export async function GET() {
  const [works, posts] = await Promise.all([getWorks(), getPostsForLlms()])

  const lines: string[] = [...getLlmsHeaderLines(), '', '## Works', '']

  for (const work of works) {
    const url = buildWorkUrl(work.slug)
    const description = extractFirstParagraph(work.content)
    const suffix = description ? `: ${description}` : ''
    lines.push(`- [${work.title}](${url})${suffix}`)
  }

  lines.push('', '## Articles', '')

  for (const post of posts) {
    const url = buildPostUrl(post.slug, post.published_at)
    const suffix = post.excerpt ? `: ${post.excerpt}` : ''
    lines.push(`- [${post.title}](${url})${suffix}`)
  }

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  })
}

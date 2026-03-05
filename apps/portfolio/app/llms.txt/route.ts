import { extractFirstParagraph } from '@ykzts/portable-text-utils'
import {
  buildPostUrl,
  buildWorkUrl,
  getLlmsHeaderLines,
  type ProfileForHeader
} from '@/lib/llms'
import { getPostsForLlms, getProfile, getWorks } from '@/lib/supabase'

export async function GET() {
  const [works, posts, profile] = await Promise.all([
    getWorks(),
    getPostsForLlms(),
    getProfile().catch((err: unknown) => {
      console.warn('Failed to fetch profile for llms.txt:', err)
      return null
    })
  ])

  const profileForHeader: ProfileForHeader | null = profile
    ? {
        name: profile.name,
        occupation: profile.occupation,
        profile_technologies: profile.profile_technologies,
        social_links: profile.social_links,
        tagline: profile.tagline
      }
    : null

  const lines: string[] = [
    ...getLlmsHeaderLines(profileForHeader),
    '',
    '## Works',
    ''
  ]

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

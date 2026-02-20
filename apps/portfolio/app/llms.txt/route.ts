import { extractFirstParagraph } from '@ykzts/portable-text-utils'
import { getSiteName, getSiteOrigin } from '@ykzts/site-config'
import { getPostsForLlms, getWorks } from '@/lib/supabase'

export async function GET() {
  'use cache'

  const [works, posts] = await Promise.all([getWorks(), getPostsForLlms()])

  const siteOrigin = getSiteOrigin()
  const siteName = getSiteName()

  const lines: string[] = [
    `# ${siteName}`,
    '',
    '> ポートフォリオと技術ブログ。JavaScriptやRubyといったプログラミング言語を用いたウェブアプリケーションの開発を得意とするソフトウェア開発者 山岸和利のサイトです。',
    '',
    'このサイトは、ポートフォリオと技術ブログを統合したサービスです。',
    '',
    '## Works',
    ''
  ]

  for (const work of works) {
    const url = new URL(`/#${work.slug}`, siteOrigin).toString()
    const description = extractFirstParagraph(work.content)
    const suffix = description ? `: ${description}` : ''
    lines.push(`- [${work.title}](${url})${suffix}`)
  }

  lines.push('', '## Articles', '')

  for (const post of posts) {
    const publishedDate = new Date(post.published_at)
    const year = String(publishedDate.getUTCFullYear())
    const month = String(publishedDate.getUTCMonth() + 1).padStart(2, '0')
    const day = String(publishedDate.getUTCDate()).padStart(2, '0')
    const url = new URL(
      `/blog/${year}/${month}/${day}/${encodeURIComponent(post.slug)}`,
      siteOrigin
    ).toString()
    const suffix = post.excerpt ? `: ${post.excerpt}` : ''
    lines.push(`- [${post.title}](${url})${suffix}`)
  }

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  })
}

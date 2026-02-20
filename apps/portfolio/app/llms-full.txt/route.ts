import { portableTextToMarkdown } from '@ykzts/portable-text-utils'
import { getSiteName, getSiteOrigin } from '@ykzts/site-config'
import { getPostsForLlmsFull, getWorks } from '@/lib/supabase'

export async function GET() {
  'use cache'

  const [works, posts] = await Promise.all([getWorks(), getPostsForLlmsFull()])

  const siteOrigin = getSiteOrigin()
  const siteName = getSiteName()

  const sections: string[] = [
    `# ${siteName}`,
    '',
    '> ポートフォリオと技術ブログ。JavaScriptやRubyといったプログラミング言語を用いたウェブアプリケーションの開発を得意とするソフトウェア開発者 山岸和利のサイトです。',
    '',
    'このサイトは、ポートフォリオと技術ブログを統合したサービスです。'
  ]

  sections.push('', '## Works', '')

  for (const work of works) {
    const url = new URL(`/#${work.slug}`, siteOrigin).toString()
    sections.push(`### [${work.title}](${url})`, '')
    const content = portableTextToMarkdown(work.content)
    if (content) {
      sections.push(content, '')
    }
    sections.push('---', '')
  }

  sections.push('## Articles', '')

  for (const post of posts) {
    const publishedDate = new Date(post.published_at)
    const year = String(publishedDate.getUTCFullYear())
    const month = String(publishedDate.getUTCMonth() + 1).padStart(2, '0')
    const day = String(publishedDate.getUTCDate()).padStart(2, '0')
    const url = new URL(
      `/blog/${year}/${month}/${day}/${encodeURIComponent(post.slug)}`,
      siteOrigin
    ).toString()
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

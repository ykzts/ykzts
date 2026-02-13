import { metadata } from '@/app/layout'
import { DEFAULT_POST_TITLE, MAX_EXCERPT_LENGTH } from '@/lib/constants'
import { getPostsForFeed } from '@/lib/supabase/posts'

export async function GET() {
  const posts = await getPostsForFeed(20)

  const baseUrl = metadata.metadataBase
    ? new URL('/blog', metadata.metadataBase).toString()
    : 'https://ykzts.com/blog'
  const feedUpdated =
    posts.length > 0
      ? new Date(posts[0].updated_at).toISOString()
      : new Date().toISOString()

  const atomXml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>ykzts.com/blog</title>
  <link href="${escapeXml(baseUrl)}" />
  <link href="${escapeXml(`${baseUrl}/atom.xml`)}" rel="self" />
  <id>${escapeXml(`${baseUrl}/`)}</id>
  <updated>${feedUpdated}</updated>
  <author>
    <name>Yamagishi Kazutoshi</name>
    <email>ykzts@desire.sh</email>
  </author>
${posts
  .map((post) => {
    const publishedDate = new Date(post.published_at)
    const year = String(publishedDate.getUTCFullYear())
    const month = String(publishedDate.getUTCMonth() + 1).padStart(2, '0')
    const day = String(publishedDate.getUTCDate()).padStart(2, '0')
    const postUrl = `${baseUrl}/${year}/${month}/${day}/${encodeURIComponent(post.slug)}`
    const title = post.title || DEFAULT_POST_TITLE
    const summary = post.excerpt || ''
    const truncatedSummary =
      summary.length > MAX_EXCERPT_LENGTH
        ? `${summary.slice(0, MAX_EXCERPT_LENGTH)}...`
        : summary

    return `  <entry>
    <title>${escapeXml(title)}</title>
    <link href="${escapeXml(postUrl)}" />
    <id>${escapeXml(postUrl)}</id>
    <published>${new Date(post.published_at).toISOString()}</published>
    <updated>${new Date(post.updated_at).toISOString()}</updated>
    <summary>${escapeXml(truncatedSummary)}</summary>
  </entry>`
  })
  .join('\n')}
</feed>`

  return new Response(atomXml, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8'
    }
  })
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

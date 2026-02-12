import { getPostsForFeed } from '@/lib/supabase/posts'

export async function GET() {
  const posts = await getPostsForFeed(20)

  const baseUrl = 'https://ykzts.com/blog'
  const feedUpdated =
    posts.length > 0
      ? new Date(posts[0].updated_at).toISOString()
      : new Date().toISOString()

  const atomXml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>ykzts.com/blog</title>
  <link href="${baseUrl}" />
  <link href="${baseUrl}/atom.xml" rel="self" />
  <id>${baseUrl}/</id>
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
    const postUrl = `${baseUrl}/${year}/${month}/${day}/${post.slug}`
    const title = post.title || 'Untitled'
    const summary = post.excerpt || ''

    return `  <entry>
    <title>${escapeXml(title)}</title>
    <link href="${postUrl}" />
    <id>${postUrl}</id>
    <published>${new Date(post.published_at).toISOString()}</published>
    <updated>${new Date(post.updated_at).toISOString()}</updated>
    <summary>${escapeXml(summary)}</summary>
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

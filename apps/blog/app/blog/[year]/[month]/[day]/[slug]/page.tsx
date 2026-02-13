import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { metadata as layoutMetadata } from '@/app/layout'
import DateDisplay from '@/components/date-display'
import Header from '@/components/header'
import PortableTextBlock from '@/components/portable-text'
import TagList from '@/components/tag-list'
import { DEFAULT_POST_TITLE } from '@/lib/constants'
import { isPortableTextValue } from '@/lib/portable-text'
import { getAllPosts, getPostBySlug } from '@/lib/supabase/posts'

type PageProps = {
  params: Promise<{
    year: string
    month: string
    day: string
    slug: string
  }>
}

export async function generateStaticParams() {
  const posts = await getAllPosts()

  // Return placeholder if no posts to satisfy Next.js Cache Components requirement
  if (posts.length === 0) {
    return [
      {
        day: '01',
        month: '01',
        slug: '_placeholder',
        year: '2024'
      }
    ]
  }

  return posts.map((post) => {
    const date = new Date(post.published_at)
    return {
      day: String(date.getUTCDate()).padStart(2, '0'),
      month: String(date.getUTCMonth() + 1).padStart(2, '0'),
      slug: post.slug,
      year: String(date.getUTCFullYear())
    }
  })
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { year, month, day, slug } = await params
  const draft = await draftMode()
  const isDraft = draft.isEnabled

  const post = await getPostBySlug(slug, isDraft)

  if (!post) {
    return {
      title: 'Not Found'
    }
  }

  // Validate URL date components match the post's published_at date
  const publishedDate = new Date(post.published_at)
  const expectedYear = String(publishedDate.getUTCFullYear())
  const expectedMonth = String(publishedDate.getUTCMonth() + 1).padStart(2, '0')
  const expectedDay = String(publishedDate.getUTCDate()).padStart(2, '0')

  if (year !== expectedYear || month !== expectedMonth || day !== expectedDay) {
    return {
      title: 'Not Found'
    }
  }

  if (!post.profile?.name) {
    return {
      title: 'Not Found'
    }
  }

  const authorName = post.profile.name

  return {
    authors: [{ name: authorName }],
    description: post.excerpt || undefined,
    openGraph: {
      authors: [authorName],
      description: post.excerpt || undefined,
      publishedTime: post.published_at,
      title: post.title || DEFAULT_POST_TITLE,
      type: 'article',
      url: `/blog/${year}/${month}/${day}/${slug}`
    },
    title: post.title || DEFAULT_POST_TITLE,
    twitter: {
      card: 'summary_large_image'
    }
  }
}

export default async function PostDetailPage({ params }: PageProps) {
  const { year, month, day, slug } = await params
  const draft = await draftMode()
  const isDraft = draft.isEnabled

  const post = await getPostBySlug(slug, isDraft)

  if (!post) {
    notFound()
  }

  // Validate URL date components match the post's published_at date
  const publishedDate = new Date(post.published_at)
  const expectedYear = String(publishedDate.getUTCFullYear())
  const expectedMonth = String(publishedDate.getUTCMonth() + 1).padStart(2, '0')
  const expectedDay = String(publishedDate.getUTCDate()).padStart(2, '0')

  if (year !== expectedYear || month !== expectedMonth || day !== expectedDay) {
    notFound()
  }

  // Validate content is valid PortableText
  if (!post.content || !isPortableTextValue(post.content)) {
    notFound()
  }

  // Profile is required for author information
  if (!post.profile?.name) {
    notFound()
  }

  // JSON-LD structured data for Article schema
  const baseUrl = layoutMetadata.metadataBase?.toString() || 'https://ykzts.com'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    author: {
      '@type': 'Person',
      name: post.profile.name,
      url: baseUrl
    },
    dateModified: post.updated_at,
    datePublished: post.published_at,
    description: post.excerpt || undefined,
    headline: post.title || DEFAULT_POST_TITLE,
    publisher: {
      '@type': 'Person',
      name: post.profile.name,
      url: baseUrl
    }
  }

  return (
    <>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe with JSON.stringify
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <article className="mx-auto max-w-3xl">
          <header className="mb-8">
            <h1 className="mb-4 font-bold text-4xl">{post.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <DateDisplay date={post.published_at} />
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="mt-4">
                <TagList className="flex flex-wrap gap-2" tags={post.tags} />
              </div>
            )}
          </header>
          <PortableTextBlock value={post.content} />
        </article>
      </main>
    </>
  )
}

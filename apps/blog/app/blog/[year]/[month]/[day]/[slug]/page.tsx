import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { metadata as layoutMetadata } from '@/app/layout'
import ArticleContent from '@/components/article-content'
import Header from '@/components/header'
import TableOfContents from '@/components/table-of-contents'
import { getDateBasedUrl } from '@/lib/blog-urls'
import { DEFAULT_POST_TITLE } from '@/lib/constants'
import { extractHeadings } from '@/lib/extract-headings'
import { isPortableTextValue } from '@/lib/portable-text'
import {
  getAdjacentPosts,
  getAllPosts,
  getPostBySlug
} from '@/lib/supabase/posts'
import { getPublisherProfile } from '@/lib/supabase/profiles'

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
      url: getDateBasedUrl(slug, post.published_at)
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

  // Fetch publisher profile and adjacent posts concurrently
  const [publisherProfile, { previousPost, nextPost }] = await Promise.all([
    getPublisherProfile(),
    getAdjacentPosts(slug, isDraft)
  ])

  // JSON-LD structured data for Article schema
  const baseUrl = layoutMetadata.metadataBase?.toString() || 'https://ykzts.com'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    author: {
      '@type': 'Person',
      name: post.profile.name
    },
    dateModified: post.version_date || post.published_at,
    datePublished: post.published_at,
    description: post.excerpt || undefined,
    headline: post.title || DEFAULT_POST_TITLE,
    publisher: {
      '@type': 'Person',
      name: publisherProfile.name,
      url: baseUrl
    }
  }

  // Extract headings for Table of Contents
  const headings = extractHeadings(post.content)
  const hasHeadings = headings.length > 0

  return (
    <>
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data is safe with JSON.stringify
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />
      <Header />
      <main className="container mx-auto px-4 py-8">
        {hasHeadings ? (
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_16rem]">
              {/* Main content */}
              <ArticleContent
                authorName={post.profile.name}
                content={post.content}
                headings={headings}
                nextPost={nextPost}
                previousPost={previousPost}
                publishedAt={post.published_at}
                tags={post.tags}
                title={post.title}
                versionDate={post.version_date}
              />

              {/* Desktop ToC sidebar */}
              <div className="hidden lg:block">
                <TableOfContents headings={headings} variant="desktop" />
              </div>
            </div>
          </div>
        ) : (
          <ArticleContent
            authorName={post.profile.name}
            content={post.content}
            headings={headings}
            nextPost={nextPost}
            previousPost={previousPost}
            publishedAt={post.published_at}
            tags={post.tags}
            title={post.title}
            versionDate={post.version_date}
          />
        )}
      </main>
    </>
  )
}

import { getSiteOrigin } from '@ykzts/site-config'
import type { Metadata, Route } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import ArticleContent from '@/components/article-content'
import Header from '@/components/header'
import PostNavigation from '@/components/post-navigation'
import SimilarPosts from '@/components/similar-posts'
import SimilarPostsSkeleton from '@/components/similar-posts-skeleton'
import TableOfContents from '@/components/table-of-contents'
import { getDateBasedUrl } from '@/lib/blog-urls'
import { DEFAULT_POST_TITLE } from '@/lib/constants'
import { extractHeadings } from '@/lib/extract-headings'
import { isPortableTextValue } from '@/lib/portable-text'
import {
  getAdjacentPosts,
  getAllPosts,
  getPostBySlug,
  getSimilarPosts
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

  const historyUrl =
    `${getDateBasedUrl(slug, post.published_at)}/history` as Route

  // JSON-LD structured data for Article schema
  const baseUrl = getSiteOrigin().origin
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
        {/* Grid layout: article body + ToC */}
        <div className="mx-auto max-w-7xl">
          {hasHeadings ? (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_16rem]">
              {/* Main content */}
              <ArticleContent
                authorName={post.profile.name}
                className="min-w-0 max-w-3xl"
                content={post.content}
                headings={headings}
                historyUrl={historyUrl}
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
          ) : (
            <ArticleContent
              authorName={post.profile.name}
              className="mx-auto max-w-3xl"
              content={post.content}
              headings={headings}
              historyUrl={historyUrl}
              publishedAt={post.published_at}
              tags={post.tags}
              title={post.title}
              versionDate={post.version_date}
            />
          )}
        </div>

        {/* Full width: article navigation */}
        <div className="mx-auto max-w-7xl">
          <PostNavigation nextPost={nextPost} previousPost={previousPost} />
        </div>

        {/* Full width: related articles */}
        <div className="mx-auto max-w-7xl">
          <div aria-atomic="false" aria-live="polite">
            <Suspense fallback={<SimilarPostsSkeleton />}>
              <SimilarPostsSection postId={post.id} />
            </Suspense>
          </div>
        </div>
      </main>
    </>
  )
}

const SIMILAR_POSTS_LIMIT = 3
const SIMILAR_POSTS_THRESHOLD = 0.5

async function SimilarPostsSection({ postId }: { postId: string }) {
  try {
    const similarPosts = await getSimilarPosts(
      postId,
      SIMILAR_POSTS_LIMIT,
      SIMILAR_POSTS_THRESHOLD
    )
    return <SimilarPosts posts={similarPosts} />
  } catch {
    // Silently fail if similar posts can't be fetched
    // This is a non-critical feature and shouldn't break the article page
    return null
  }
}

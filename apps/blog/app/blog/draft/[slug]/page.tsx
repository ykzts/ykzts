import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
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
  getPostBySlug,
  getSimilarPosts
} from '@/lib/supabase/posts'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

// Return a placeholder to satisfy the Next.js Cache Components requirement.
// Draft slugs are not known at build time, so all actual paths are rendered
// dynamically on request.
export async function generateStaticParams() {
  return [{ slug: '_placeholder' }]
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { slug } = await params

  if (slug === '_placeholder') {
    return { title: 'Not Found' }
  }

  const draft = await draftMode()

  if (!draft.isEnabled) {
    return {
      title: 'Not Found'
    }
  }

  const post = await getPostBySlug(slug, true)

  if (!post) {
    return {
      title: 'Not Found'
    }
  }

  const fediverseCreator = post.profile?.fediverse_creator?.trim()

  return {
    other: fediverseCreator
      ? { 'fediverse:creator': fediverseCreator }
      : undefined,
    title: post.title || DEFAULT_POST_TITLE
  }
}

export default async function DraftPostPage({ params }: PageProps) {
  const { slug } = await params

  if (slug === '_placeholder') {
    notFound()
  }

  const draft = await draftMode()

  // Draft posts are only accessible in draft mode
  if (!draft.isEnabled) {
    notFound()
  }

  const post = await getPostBySlug(slug, true)

  if (!post) {
    notFound()
  }

  // If the post has been published, redirect to the canonical date-based URL
  if (post.published_at) {
    redirect(getDateBasedUrl(slug, post.published_at))
  }

  // Validate content is valid PortableText
  if (!post.content || !isPortableTextValue(post.content)) {
    notFound()
  }

  // Profile is required for author information
  if (!post.profile?.name) {
    notFound()
  }

  // Fetch adjacent posts
  const { previousPost, nextPost } = await getAdjacentPosts(slug, true)

  // Extract headings for Table of Contents
  const headings = extractHeadings(post.content)
  const hasHeadings = headings.length > 0

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-7xl">
          {hasHeadings ? (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_16rem]">
              <ArticleContent
                authorName={post.profile.name}
                className="min-w-0 max-w-3xl"
                content={post.content}
                headings={headings}
                publishedAt={post.published_at}
                tags={post.tags}
                title={post.title}
                versionDate={post.version_date}
              />
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
              publishedAt={post.published_at}
              tags={post.tags}
              title={post.title}
              versionDate={post.version_date}
            />
          )}
        </div>

        <div className="mx-auto max-w-7xl">
          <PostNavigation nextPost={nextPost} previousPost={previousPost} />
        </div>

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
    return null
  }
}

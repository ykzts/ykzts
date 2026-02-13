import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import Header from '@/components/header'
import Pagination from '@/components/pagination'
import PostCard from '@/components/post-card'
import {
  getAllTags,
  getPostCountByTag,
  getPostsByTag,
  POSTS_PER_PAGE
} from '@/lib/supabase/posts'

type PageProps = {
  params: Promise<{ tag: string }>
}

export async function generateStaticParams() {
  const tags = await getAllTags()

  // Return a dummy tag if no tags exist to satisfy Next.js Cache Components requirement
  if (tags.length === 0) {
    return [{ tag: '_placeholder' }]
  }

  return tags.map((tag) => ({
    tag
  }))
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)

  return {
    description: `${decodedTag}タグの記事一覧`,
    title: `${decodedTag}タグの記事`
  }
}

export default async function TagArchivePage({ params }: PageProps) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)

  const draft = await draftMode()
  const isDraft = draft.isEnabled

  const posts = await getPostsByTag(decodedTag, 1, isDraft)
  const postCount = await getPostCountByTag(decodedTag, isDraft)

  if (!posts || posts.length === 0) {
    notFound()
  }

  const totalPages = Math.ceil(postCount / POSTS_PER_PAGE)

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 font-bold text-3xl">
          {decodedTag} ({postCount}件)
        </h1>
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              baseUrl={`/blog/tags/${encodeURIComponent(decodedTag)}/page`}
              currentPage={1}
              totalPages={totalPages}
            />
          </div>
        )}
      </main>
    </>
  )
}

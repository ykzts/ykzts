import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import Header from '@/components/header'
import Pagination from '@/components/pagination'
import PostCard from '@/components/post-card'
import {
  getPostCountByTag,
  getPostsByTag,
  POSTS_PER_PAGE
} from '@/lib/supabase/posts'

type PageProps = {
  params: Promise<{ tag: string; num: string }>
}

export async function generateStaticParams() {
  // Return placeholder to satisfy Next.js Cache Components requirement
  // Actual tag pagination pages will be generated on-demand
  return [{ num: '2', tag: '_placeholder' }]
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { tag, num } = await params
  const decodedTag = decodeURIComponent(tag)
  const pageNum = Number.parseInt(num, 10)

  if (Number.isNaN(pageNum) || pageNum < 1) {
    return {
      title: 'ページ'
    }
  }

  return {
    title: `${decodedTag}タグの記事 - ページ ${pageNum}`
  }
}

export default async function TagPaginationPage({ params }: PageProps) {
  const { tag, num } = await params
  const decodedTag = decodeURIComponent(tag)
  const pageNum = Number.parseInt(num, 10)

  // Handle invalid page numbers
  if (Number.isNaN(pageNum) || pageNum < 1) {
    notFound()
  }

  // Redirect page 1 to tag index
  if (pageNum === 1) {
    redirect(`/blog/tags/${encodeURIComponent(decodedTag)}`)
  }

  const draft = await draftMode()
  const isDraft = draft.isEnabled

  const posts = await getPostsByTag(decodedTag, pageNum, isDraft)
  const postCount = await getPostCountByTag(decodedTag, isDraft)

  if (!posts || posts.length === 0) {
    notFound()
  }

  const totalPages = Math.ceil(postCount / POSTS_PER_PAGE)

  // Handle page numbers beyond total pages
  if (pageNum > totalPages) {
    notFound()
  }

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
        <div className="mt-8">
          <Pagination
            baseUrl={`/blog/tags/${encodeURIComponent(decodedTag)}/page`}
            currentPage={pageNum}
            totalPages={totalPages}
          />
        </div>
      </main>
    </>
  )
}

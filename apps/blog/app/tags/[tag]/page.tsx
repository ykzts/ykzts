import type { Metadata } from 'next'
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

  return tags.map((tag) => ({
    tag
  }))
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { tag } = await params

  return {
    description: `${tag}タグの記事一覧`,
    title: `${tag}タグの記事`
  }
}

export default async function TagArchivePage({ params }: PageProps) {
  const { tag } = await params

  const posts = await getPostsByTag(tag, 1)
  const postCount = await getPostCountByTag(tag)

  if (!posts || posts.length === 0) {
    notFound()
  }

  const totalPages = Math.ceil(postCount / POSTS_PER_PAGE)

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 font-bold text-3xl">
          {tag} ({postCount}件)
        </h1>
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              baseUrl={`/tags/${tag}/page`}
              currentPage={1}
              totalPages={totalPages}
            />
          </div>
        )}
      </main>
    </>
  )
}

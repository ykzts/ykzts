import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Header from '@/components/header'
import Pagination from '@/components/pagination'
import PostCard from '@/components/post-card'
import { getPosts, getTotalPages } from '@/lib/supabase/posts'

export const metadata: Metadata = {
  description: 'ykztsの技術ブログ',
  openGraph: {
    description: 'ykztsの技術ブログ',
    title: 'Blog',
    type: 'website',
    url: 'https://ykzts.com/blog'
  },
  title: 'Blog'
}

export default async function HomePage() {
  const draft = await draftMode()
  const isDraft = draft.isEnabled

  const posts = await getPosts(1, isDraft)
  const totalPages = await getTotalPages(isDraft)

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination currentPage={1} totalPages={totalPages} />
          </div>
        )}
      </main>
    </>
  )
}

import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Header from '@/components/header'
import Pagination from '@/components/pagination'
import PostCard from '@/components/post-card'
import { getPosts, getTotalPages } from '@/lib/supabase/posts'

type PageProps = {
  params: Promise<{ num: string }>
}

export async function generateStaticParams() {
  const totalPages = await getTotalPages()
  const pages = []

  // Generate pages 2 to totalPages (page 1 is the home page)
  for (let i = 2; i <= totalPages; i++) {
    pages.push({ num: String(i) })
  }

  // Return placeholder if no pages to satisfy Next.js Cache Components requirement
  if (pages.length === 0) {
    return [{ num: '2' }]
  }

  return pages
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { num } = await params
  const pageNum = Number.parseInt(num, 10)

  if (Number.isNaN(pageNum) || pageNum < 1) {
    return {
      title: 'ページ'
    }
  }

  return {
    title: `ページ ${pageNum}`
  }
}

export default async function PaginationPage({ params }: PageProps) {
  const { num } = await params
  const pageNum = Number.parseInt(num, 10)

  // Handle invalid page numbers (NaN or non-positive)
  if (Number.isNaN(pageNum) || pageNum < 1) {
    notFound()
  }

  // Redirect page 1 to home
  if (pageNum === 1) {
    redirect('/blog')
  }

  const totalPages = await getTotalPages()

  // Handle page numbers beyond total pages
  if (pageNum > totalPages) {
    notFound()
  }

  const posts = await getPosts(pageNum)

  // If no posts found, show not found
  if (!posts || posts.length === 0) {
    notFound()
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        <div className="mt-8">
          <Pagination currentPage={pageNum} totalPages={totalPages} />
        </div>
      </main>
    </>
  )
}

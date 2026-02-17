import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getPostById } from '@/lib/posts'
import { PostForm } from './_components/post-form'
import { PostFormSkeleton } from './_components/post-form-skeleton'

export function generateStaticParams() {
  // Return dummy param for build-time validation with Cache Components
  return [{ id: '_' }]
}

async function PostEditContent({ id }: { id: string }) {
  const post = await getPostById(id)

  if (!post) {
    notFound()
  }

  return (
    <div className="rounded-xl bg-card p-6 text-card-foreground ring-1 ring-foreground/10">
      <PostForm post={post} />
    </div>
  )
}

export default async function EditPostPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div>
      <h1 className="mb-6 font-bold text-3xl">投稿編集</h1>
      <Suspense
        fallback={
          <div className="rounded-xl bg-card p-6 text-card-foreground ring-1 ring-foreground/10">
            <PostFormSkeleton />
          </div>
        }
      >
        <PostEditContent id={id} />
      </Suspense>
    </div>
  )
}

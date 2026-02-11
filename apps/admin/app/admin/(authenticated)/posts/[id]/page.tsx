import { Card } from '@ykzts/ui/card'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getPost } from '@/lib/data'
import { PostForm } from './_components/post-form'
import { PostFormSkeleton } from './_components/post-form-skeleton'

export function generateStaticParams() {
  // Return dummy param for build-time validation with Cache Components
  return [{ id: '_' }]
}

async function PostEditContent({ id }: { id: string }) {
  const post = await getPost(id)

  if (!post) {
    notFound()
  }

  return (
    <Card className="p-6">
      <PostForm post={post} />
    </Card>
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
          <Card className="p-6">
            <PostFormSkeleton />
          </Card>
        }
      >
        <PostEditContent id={id} />
      </Suspense>
    </div>
  )
}

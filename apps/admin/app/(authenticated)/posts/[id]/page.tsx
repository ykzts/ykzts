import { EditResourcePage } from '@/components/resource-pages'
import { getPostById } from '@/lib/posts'
import { PostForm } from './_components/post-form'
import { PostFormSkeleton } from './_components/post-form-skeleton'

export function generateStaticParams() {
  // Return dummy param for build-time validation with Cache Components
  return [{ id: '_' }]
}

export default async function EditPostPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <EditResourcePage
      FormComponent={PostForm}
      getResource={getPostById}
      id={id}
      resourcePropName="post"
      SkeletonComponent={PostFormSkeleton}
      title="投稿編集"
    />
  )
}

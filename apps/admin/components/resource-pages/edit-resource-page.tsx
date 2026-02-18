import { notFound } from 'next/navigation'
import type { ComponentType } from 'react'
import { Suspense } from 'react'
import { Panel } from '@/components/panel'

interface EditResourcePageProps<T, P extends Record<string, unknown>> {
  FormComponent: ComponentType<P>
  SkeletonComponent: ComponentType
  getResource: (id: string) => Promise<T | null>
  id: string
  resourcePropName: string
  title: string
}

/**
 * Generic component for resource editing pages.
 *
 * Provides a consistent layout for editing resources with:
 * - Title
 * - Data fetching with notFound handling
 * - Suspense boundary with skeleton fallback
 * - Panel wrapper
 *
 * Reduces boilerplate across different resource types (posts, works, etc.).
 *
 * @example
 * ```tsx
 * import { getPostById } from '@/lib/posts'
 * import { PostForm } from './_components/post-form'
 * import { PostFormSkeleton } from './_components/post-form-skeleton'
 *
 * export default async function EditPostPage({
 *   params
 * }: {
 *   params: Promise<{ id: string }>
 * }) {
 *   const { id } = await params
 *
 *   return (
 *     <EditResourcePage
 *       title="投稿編集"
 *       id={id}
 *       getResource={getPostById}
 *       FormComponent={PostForm}
 *       SkeletonComponent={PostFormSkeleton}
 *       resourcePropName="post"
 *     />
 *   )
 * }
 * ```
 */
export function EditResourcePage<T, P extends Record<string, unknown>>({
  FormComponent,
  SkeletonComponent,
  getResource,
  id,
  resourcePropName,
  title
}: EditResourcePageProps<T, P>) {
  async function EditContent() {
    const resource = await getResource(id)

    if (!resource) {
      notFound()
    }

    const formProps = { [resourcePropName]: resource } as P

    return (
      <Panel>
        <FormComponent {...formProps} />
      </Panel>
    )
  }

  return (
    <div>
      <h1 className="mb-6 font-bold text-3xl">{title}</h1>
      <Suspense
        fallback={
          <Panel>
            <SkeletonComponent />
          </Panel>
        }
      >
        <EditContent />
      </Suspense>
    </div>
  )
}

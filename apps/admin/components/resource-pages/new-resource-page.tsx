import type { ComponentType } from 'react'
import { Panel } from '@/components/panel'

interface NewResourcePageProps {
  title: string
  FormComponent: ComponentType
}

/**
 * Generic component for resource creation pages.
 *
 * Provides a consistent layout for creating new resources with a title and form.
 * Reduces boilerplate across different resource types (posts, works, etc.).
 *
 * @example
 * ```tsx
 * import { PostForm } from './post-form'
 *
 * export default function NewPostPage() {
 *   return <NewResourcePage title="投稿新規作成" FormComponent={PostForm} />
 * }
 * ```
 */
export function NewResourcePage({
  title,
  FormComponent
}: NewResourcePageProps) {
  return (
    <div>
      <h1 className="mb-6 font-bold text-3xl">{title}</h1>
      <Panel>
        <FormComponent />
      </Panel>
    </div>
  )
}

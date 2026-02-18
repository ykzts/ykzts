import { EditResourcePage } from '@/components/resource-pages'
import { getWork } from '@/lib/data'
import { WorkForm } from './work-form'
import { WorkFormSkeleton } from './work-form-skeleton'

export function generateStaticParams() {
  // Return dummy param for build-time validation with Cache Components
  return [{ id: '_' }]
}

export default async function EditWorkPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <EditResourcePage
      FormComponent={WorkForm}
      getResource={getWork}
      id={id}
      resourcePropName="work"
      SkeletonComponent={WorkFormSkeleton}
      title="作品編集"
    />
  )
}

import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Panel } from '@/components/panel'
import { getWork } from '@/lib/data'
import { WorkForm } from '../_components/work-form'
import { WorkFormSkeleton } from '../_components/work-form-skeleton'
import { deleteWork, updateWork } from './actions'

export function generateStaticParams() {
  // Return dummy param for build-time validation with Cache Components
  return [{ id: '_' }]
}

async function WorkEditContent({ id }: { id: string }) {
  const work = await getWork(id)

  if (!work) {
    notFound()
  }

  return (
    <Panel>
      <WorkForm
        deleteAction={deleteWork}
        updateAction={updateWork}
        work={work}
      />
    </Panel>
  )
}

export default async function EditWorkPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div>
      <h1 className="mb-6 font-bold text-3xl">作品編集</h1>
      <Suspense
        fallback={
          <Panel>
            <WorkFormSkeleton />
          </Panel>
        }
      >
        <WorkEditContent id={id} />
      </Suspense>
    </div>
  )
}

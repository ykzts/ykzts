import { Card } from '@ykzts/ui/card'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getWork } from '@/lib/data'
import { WorkForm } from './work-form'
import { WorkFormSkeleton } from './work-form-skeleton'

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
    <Card className="p-6">
      <WorkForm work={work} />
    </Card>
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
          <Card className="p-6">
            <WorkFormSkeleton />
          </Card>
        }
      >
        <WorkEditContent id={id} />
      </Suspense>
    </div>
  )
}

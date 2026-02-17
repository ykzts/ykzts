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
    <div className="rounded-xl bg-card p-6 text-card-foreground ring-1 ring-foreground/10">
      <WorkForm work={work} />
    </div>
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
          <div className="rounded-xl bg-card p-6 text-card-foreground ring-1 ring-foreground/10">
            <WorkFormSkeleton />
          </div>
        }
      >
        <WorkEditContent id={id} />
      </Suspense>
    </div>
  )
}

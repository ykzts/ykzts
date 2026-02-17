import { Suspense } from 'react'
import Skeleton from '@/components/skeleton'
import range from '@/lib/range'
import { getWorks } from '@/lib/supabase'
import WorksList from './works-list'

function WorksSkeleton() {
  return (
    <section className="mx-auto max-w-4xl py-20" id="works">
      <h2 className="mb-12 font-semibold text-base text-muted-foreground uppercase tracking-widest">
        Works
      </h2>
      <div className="space-y-12">
        {Array.from(range(0, 2), (i) => (
          <article
            className="rounded-xl border border-border bg-card p-6"
            key={`skeleton-${i}`}
          >
            <Skeleton className="mb-4 h-6 w-1/3" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </article>
        ))}
      </div>
    </section>
  )
}

async function WorksImpl() {
  const works = await getWorks()

  return (
    <section className="mx-auto max-w-4xl py-20" id="works">
      <h2 className="mb-12 font-semibold text-base text-muted-foreground uppercase tracking-widest">
        Works
      </h2>
      <WorksList works={works} />
    </section>
  )
}

export default function Works() {
  return (
    <Suspense fallback={<WorksSkeleton />}>
      <WorksImpl />
    </Suspense>
  )
}

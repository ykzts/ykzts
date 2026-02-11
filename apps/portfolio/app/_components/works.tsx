import { Suspense } from 'react'
import Skeleton from '@/components/skeleton'
import range from '@/lib/range'
import { getWorks } from '@/lib/supabase'
import PortableTextBlock from './portable-text'

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
      <div className="space-y-8">
        {works.map((work) => (
          <article
            className="group rounded-xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-md"
            id={work.slug}
            key={work.slug}
          >
            <h3 className="mb-4 font-semibold text-2xl text-card-foreground">
              {work.title}
            </h3>
            {work.content && (
              <div className="prose prose-base max-w-none prose-a:text-primary prose-p:text-base prose-p:text-muted-foreground prose-strong:text-foreground prose-p:leading-relaxed prose-a:no-underline prose-a:hover:underline">
                <PortableTextBlock value={work.content} />
              </div>
            )}
          </article>
        ))}
      </div>
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

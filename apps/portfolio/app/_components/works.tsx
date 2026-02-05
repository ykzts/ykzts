import {
  PortableText,
  type PortableTextMarkComponentProps,
  type PortableTextReactComponents
} from '@portabletext/react'
import { Suspense } from 'react'
import Link from '@/components/link'
import Skeleton from '@/components/skeleton'
import range from '@/lib/range'
import { getWorks } from '@/lib/sanity'

const portableTextComponents = {
  marks: {
    link({
      children,
      value
    }: PortableTextMarkComponentProps<{ _type: string; href: string }>) {
      const href = value?.href

      return <Link href={href}>{children}</Link>
    }
  }
} satisfies Partial<PortableTextReactComponents>

function WorksSkeleton() {
  return (
    <section className="mx-auto max-w-4xl py-16" id="works">
      <h2 className="mb-12 font-semibold text-muted text-sm uppercase tracking-widest">
        Works
      </h2>
      <div className="space-y-12">
        {Array.from(range(0, 3), (i) => (
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
    <section className="mx-auto max-w-4xl py-16" id="works">
      <h2 className="mb-12 font-semibold text-muted text-sm uppercase tracking-widest">
        Works
      </h2>
      <div className="space-y-8">
        {works.map((work) => (
          <article
            className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-accent/50 hover:bg-card/80"
            id={work.slug}
            key={work.slug}
          >
            <h3 className="mb-4 font-semibold text-card-foreground text-xl transition-colors duration-200 group-hover:text-accent">
              {work.title}
            </h3>
            <div className="prose prose-invert prose-sm max-w-none prose-p:text-muted prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground">
              <PortableText
                components={portableTextComponents}
                value={work.content}
              />
            </div>
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

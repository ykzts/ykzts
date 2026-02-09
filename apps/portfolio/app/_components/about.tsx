import { Suspense } from 'react'
import Skeleton from '@/components/skeleton'
import range from '@/lib/range'
import { getProfile } from '@/lib/supabase'
import PortableTextBlock from './portable-text'

function AboutSkeleton() {
  return (
    <section className="mx-auto max-w-4xl py-20" id="about">
      <h2 className="mb-10 font-semibold text-base text-muted uppercase tracking-widest">
        About
      </h2>
      <div className="space-y-4">
        {Array.from(range(0, 3), (i) => (
          <Skeleton className="h-4 w-full" key={`about-${i}`} />
        ))}
      </div>
    </section>
  )
}

async function AboutImpl() {
  const profile = await getProfile()

  if (!profile.about) {
    return null
  }

  return (
    <section className="mx-auto max-w-4xl py-20" id="about">
      <h2 className="mb-10 font-semibold text-base text-muted uppercase tracking-widest">
        About
      </h2>
      <div className="prose prose-lg max-w-none prose-a:text-accent prose-headings:text-foreground prose-p:text-base prose-p:text-muted prose-strong:text-foreground prose-p:leading-relaxed prose-a:no-underline prose-a:hover:underline">
        <PortableTextBlock value={profile.about} />
      </div>
    </section>
  )
}

export default function About() {
  return (
    <Suspense fallback={<AboutSkeleton />}>
      <AboutImpl />
    </Suspense>
  )
}

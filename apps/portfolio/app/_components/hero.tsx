import { Badge } from '@ykzts/ui/components/badge'
import Image from 'next/image'
import { Suspense } from 'react'
import Skeleton from '@/components/skeleton'
import range from '@/lib/range'
import { getProfile } from '@/lib/supabase'
import keyVisual from '../_assets/key-visual.jpg'

function HeroSkeleton() {
  return (
    <header className="px-6 py-20 md:px-12 lg:px-24 lg:py-28">
      <div className="mx-auto flex max-w-4xl flex-col-reverse items-start gap-12 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex-1">
          <Skeleton className="mb-4 h-12 w-48" />
          <Skeleton className="mb-8 h-6 w-full" />
          <div className="flex flex-wrap gap-2">
            {Array.from(range(0, 10), (i) => (
              <Skeleton className="h-8 w-24" key={`tech-${i}`} />
            ))}
          </div>
        </div>
        <Skeleton className="size-80 rounded-2xl" />
      </div>
    </header>
  )
}

async function HeroImpl() {
  const profile = await getProfile()

  return (
    <header className="px-6 py-20 md:px-12 lg:px-24 lg:py-28">
      <div className="mx-auto flex max-w-4xl flex-col-reverse items-start gap-12 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex-1">
          <h1 className="mb-4 font-bold text-5xl text-foreground tracking-tight md:text-6xl lg:text-7xl">
            {profile.name}
          </h1>
          <p className="mb-8 max-w-2xl text-muted-foreground text-xl leading-relaxed">
            {profile.tagline}
          </p>

          {/* Tech Stack Tags */}
          <div className="flex flex-wrap gap-2">
            {profile.technologies.map((tech) => (
              <Badge key={tech.name} variant="secondary">
                {tech.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="shrink-0">
          <Image
            alt={profile.name}
            className="rounded-2xl shadow-lg"
            height={320}
            placeholder="blur"
            priority
            src={keyVisual}
            width={320}
          />
        </div>
      </div>
    </header>
  )
}

export default function Hero() {
  return (
    <Suspense fallback={<HeroSkeleton />}>
      <HeroImpl />
    </Suspense>
  )
}

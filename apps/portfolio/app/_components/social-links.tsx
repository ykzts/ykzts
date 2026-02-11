import { Suspense } from 'react'
import Link from '@/components/link'
import Skeleton from '@/components/skeleton'
import { getSocialInfo } from '@/lib/social-services'
import { getProfile } from '@/lib/supabase'

function SocialLinksSkeleton() {
  const placeholders = ['one', 'two', 'three', 'four', 'five']

  return (
    <ul className="flex gap-3">
      {placeholders.map((placeholder) => (
        <li key={`social-skeleton-${placeholder}`}>
          <Skeleton className="size-10 rounded-lg" />
        </li>
      ))}
    </ul>
  )
}

async function SocialLinksImpl() {
  const profile = await getProfile()

  return (
    <ul className="flex gap-3">
      {profile.social_links.map((link) => {
        const { icon, label, url } = getSocialInfo(
          link.url,
          link.service,
          profile.name
        )

        return (
          <li key={link.url}>
            <Link
              aria-label={label}
              className="inline-flex size-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all duration-200 hover:border-primary hover:text-primary focus:outline-2 focus:outline-accent focus:outline-offset-2"
              href={url}
              rel="me"
              target="_blank"
            >
              {icon}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default function SocialLinks() {
  return (
    <Suspense fallback={<SocialLinksSkeleton />}>
      <SocialLinksImpl />
    </Suspense>
  )
}

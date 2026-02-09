import Link from 'next/link'
import { Suspense } from 'react'
import ExternalLink from '@/components/link'
import Skeleton from '@/components/skeleton'
import { getProfile } from '@/lib/supabase'

function FooterSkeleton() {
  return (
    <footer className="border-border border-t px-6 py-12 md:px-12 lg:px-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 text-base text-muted md:flex-row">
        <div className="flex flex-col items-center gap-1 md:items-start">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-5 w-32" />
      </div>
    </footer>
  )
}

async function FooterImpl() {
  const profile = await getProfile()

  return (
    <footer className="border-border border-t px-6 py-12 md:px-12 lg:px-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 text-base text-muted md:flex-row">
        <div className="flex flex-col items-center gap-1 md:items-start">
          <span>© {profile.name}</span>
          <span className="text-sm">
            Artwork by{' '}
            <ExternalLink
              className="text-accent transition-colors duration-200 hover:text-accent/80"
              href="https://x.com/diru_k1005"
            >
              Kannazuki Diru
            </ExternalLink>
          </span>
        </div>
        <Link
          className="transition-colors duration-200 hover:text-accent"
          href="/privacy"
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  )
}

export default function Footer() {
  return (
    <Suspense fallback={<FooterSkeleton />}>
      <FooterImpl />
    </Suspense>
  )
}

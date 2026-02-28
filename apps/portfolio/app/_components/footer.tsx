import Footer from '@ykzts/layout/components/footer'
import Link from 'next/link'
import { Suspense } from 'react'
import ExternalLink from '@/components/link'
import Skeleton from '@/components/skeleton'
import { getProfile } from '@/lib/supabase'

function FooterSkeleton() {
  return (
    <Footer>
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-1 md:items-start">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-5 w-32" />
      </div>
    </Footer>
  )
}

async function FooterImpl() {
  const profile = await getProfile()
  const kv = Array.isArray(profile.key_visual)
    ? profile.key_visual[0]
    : profile.key_visual

  const artworkText = kv?.artist_name
    ? (kv.attribution ?? `Artwork by ${kv.artist_name}`)
    : null

  return (
    <Footer>
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-1 md:items-start">
          <span>© {profile.name}</span>
          {artworkText && (
            <span className="text-sm">
              {kv?.artist_url ? (
                <ExternalLink
                  className="text-primary transition-colors duration-200 hover:text-primary/80"
                  href={kv.artist_url}
                >
                  {artworkText}
                </ExternalLink>
              ) : (
                artworkText
              )}
            </span>
          )}
        </div>
        <Link
          className="transition-colors duration-200 hover:text-primary"
          href="/privacy"
        >
          Privacy Policy
        </Link>
      </div>
    </Footer>
  )
}

export default function PortfolioFooter() {
  return (
    <Suspense fallback={<FooterSkeleton />}>
      <FooterImpl />
    </Suspense>
  )
}

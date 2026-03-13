import SiteFooter from '@ykzts/layout/components/site-footer'
import { getProfile } from '@ykzts/supabase/queries'
import Link from 'next/link'
import ExternalLink from '@/components/link'

async function ArtworkCredit() {
  const profile = await getProfile()
  const kv = Array.isArray(profile.key_visual)
    ? profile.key_visual[0]
    : profile.key_visual

  if (!kv?.artist_name) {
    return null
  }

  return (
    <span className="text-sm">
      {kv.attribution ?? 'Artwork by'}{' '}
      {kv.artist_url ? (
        <ExternalLink
          className="text-primary transition-colors duration-200 hover:text-primary/80"
          href={kv.artist_url}
        >
          {kv.artist_name}
        </ExternalLink>
      ) : (
        kv.artist_name
      )}
    </span>
  )
}

export default function PortfolioFooter() {
  return (
    <SiteFooter
      artworkCredit={<ArtworkCredit />}
      privacyLink={
        <Link
          className="transition-colors duration-200 hover:text-primary"
          href="/privacy"
        >
          Privacy Policy
        </Link>
      }
    />
  )
}

import { getProfile } from '@ykzts/supabase/queries'
import type { ReactNode } from 'react'
import { Suspense } from 'react'
import Footer from './footer'
import FooterContent from './footer-content'

type Props = {
  artworkCredit?: ReactNode
  privacyLink: ReactNode
}

async function SiteFooterImpl({ artworkCredit, privacyLink }: Props) {
  const profile = await getProfile()

  return (
    <Footer>
      <FooterContent
        artworkCredit={artworkCredit}
        copyright={<span>© {profile.name}</span>}
        privacyLink={privacyLink}
      />
    </Footer>
  )
}

function SiteFooterSkeleton() {
  return (
    <Footer>
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
      </div>
    </Footer>
  )
}

export default function SiteFooter(props: Props) {
  return (
    <Suspense fallback={<SiteFooterSkeleton />}>
      <SiteFooterImpl {...props} />
    </Suspense>
  )
}

import Footer from '@ykzts/layout/components/footer'
import FooterContent from '@ykzts/layout/components/footer-content'
import { getProfile } from '@ykzts/supabase/queries'
import { Suspense } from 'react'
import Link from '@/components/link'

async function FooterImpl() {
  const profile = await getProfile()

  return (
    <Footer>
      <FooterContent
        artworkCredit={
          <span className="text-sm">
            Artwork by{' '}
            <Link
              className="text-primary transition-colors duration-200 hover:text-primary/80"
              href="https://x.com/diru_k1005"
            >
              Kannazuki Diru
            </Link>
          </span>
        }
        copyright={<span>© {profile.name}</span>}
        privacyLink={
          <Link
            className="transition-colors duration-200 hover:text-primary"
            href="/privacy"
          >
            プライバシーポリシー
          </Link>
        }
      />
    </Footer>
  )
}

function FooterSkeleton() {
  return (
    <Footer>
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="h-10 w-48 animate-pulse rounded bg-muted" />
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
      </div>
    </Footer>
  )
}

export default function BlogFooter() {
  return (
    <Suspense fallback={<FooterSkeleton />}>
      <FooterImpl />
    </Suspense>
  )
}

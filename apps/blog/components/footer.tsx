import Footer from '@ykzts/layout/components/footer'
import { Suspense } from 'react'
import Link from '@/components/link'
import { getPublisherProfile } from '@/lib/supabase/profiles'

async function FooterImpl() {
  const profile = await getPublisherProfile()

  return (
    <Footer>
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-1 md:items-start">
          <span>© {profile.name}</span>
          <span className="text-sm">
            Artwork by{' '}
            <Link
              className="text-primary transition-colors duration-200 hover:text-primary/80"
              href="https://x.com/diru_k1005"
            >
              Kannazuki Diru
            </Link>
          </span>
        </div>
        <Link
          className="transition-colors duration-200 hover:text-primary"
          href="/privacy"
        >
          プライバシーポリシー
        </Link>
      </div>
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

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '404 Not Found'
}

export default function NotFound() {
  return (
    <main className="px-6 py-16 md:px-12 lg:px-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-4 font-bold text-4xl">404 Not Found</h1>
        <p className="mb-8 text-lg text-muted-foreground leading-8">
          お探しのページを見つけられませんでした。
        </p>
        <Link className="text-primary hover:underline" href="/blog">
          ブログトップへ戻る
        </Link>
      </div>
    </main>
  )
}

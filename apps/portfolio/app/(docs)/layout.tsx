import Link from 'next/link'
import type { ReactNode } from 'react'

export default function DocsLayout({
  children,
  title
}: Readonly<{
  children: ReactNode
  title: ReactNode
}>) {
  return (
    <div className="min-h-screen bg-brand px-4 pb-4 pt-16 supports-[height:100dvh]:min-h-dvh">
      <main className="prose prose-slate mx-auto max-w-3xl rounded-2xl bg-white/80 p-4 shadow-md backdrop-blur">
        {title}

        {children}

        <p className="mt-40">
          <Link href="/">トップページに戻る</Link>
        </p>
      </main>
    </div>
  )
}

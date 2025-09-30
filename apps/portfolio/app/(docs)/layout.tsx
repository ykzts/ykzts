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
    <div className="min-h-screen bg-[--color-brand] px-4 pb-4 pt-16 supports-[height:100dvh]:min-h-dvh">
      <main className="mx-auto max-w-[45rem] rounded-2xl bg-white/80 p-4 shadow-[2px_2px_2px_1px_rgba(0,0,0,0.1)] backdrop-blur [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table_td]:border [&_table_td]:border-[#ddd] [&_table_td]:bg-[#fafafa] [&_table_td]:p-2 [&_table_td]:text-left [&_table_th]:border [&_table_th]:border-[#ddd] [&_table_th]:bg-[#f5f5f5] [&_table_th]:p-2 [&_table_th]:text-left [&_table_th]:font-semibold">
        {title}

        {children}

        <p className="mt-40">
          <Link href="/">トップページに戻る</Link>
        </p>
      </main>
    </div>
  )
}

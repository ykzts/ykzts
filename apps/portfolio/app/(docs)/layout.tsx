import Link from 'next/link'

export default function DocsLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="min-h-dvh px-4 pt-16 pb-4">
      <main className="prose prose-slate mx-auto max-w-3xl rounded-2xl bg-white/80 p-4 shadow-md backdrop-blur">
        {children}

        <p className="mt-40">
          <Link href="/">トップページに戻る</Link>
        </p>
      </main>
    </div>
  )
}

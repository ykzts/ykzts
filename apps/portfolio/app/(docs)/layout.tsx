import Link from 'next/link'

export default function DocsLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="min-h-dvh px-6 py-16 md:px-12 lg:px-24">
      <main className="prose prose-lg mx-auto max-w-3xl prose-p:text-base prose-p:text-muted prose-p:leading-relaxed prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-headings:text-foreground">
        {children}

        <p className="mt-16">
          <Link
            className="inline-flex items-center gap-2 text-accent transition-colors duration-200 hover:text-accent/80"
            href="/"
          >
            <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                d="M19 12H5M12 19l-7-7 7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            トップページに戻る
          </Link>
        </p>
      </main>
    </div>
  )
}

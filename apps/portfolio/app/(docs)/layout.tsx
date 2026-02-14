import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function DocsLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="min-h-dvh px-6 py-16 md:px-12 lg:px-24">
      <main className="prose prose-lg mx-auto max-w-3xl prose-a:text-primary prose-headings:text-foreground prose-p:text-base prose-p:text-muted-foreground prose-strong:text-foreground prose-p:leading-relaxed prose-a:no-underline prose-a:hover:underline">
        {children}

        <p className="mt-16">
          <Link
            className="inline-flex items-center gap-2 text-primary transition-colors duration-200 hover:text-primary/80"
            href="/"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            トップページに戻る
          </Link>
        </p>
      </main>
    </div>
  )
}

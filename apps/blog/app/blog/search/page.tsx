import type { Metadata } from 'next'
import Header from '@/components/header'
import SearchForm from '@/components/search-form'

export const metadata: Metadata = {
  description: 'ブログ記事を検索',
  openGraph: {
    description: 'ブログ記事を検索',
    title: 'Search | ykzts.com/blog',
    type: 'website',
    url: 'https://ykzts.com/blog/search'
  },
  title: 'Search'
}

export default function SearchPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 font-bold text-3xl">ブログ記事検索</h1>
        <p className="mb-8 text-muted-foreground">
          キーワードを入力して、関連する記事を検索できます。
        </p>
        <SearchForm />
      </main>
    </>
  )
}

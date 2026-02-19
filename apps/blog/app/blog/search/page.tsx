import type { Metadata } from 'next'
import { Suspense } from 'react'
import Header from '@/components/header'
import SearchForm from '@/components/search-form'
import SearchResults from '@/components/search-results'
import { searchPosts } from '@/lib/supabase/posts'

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({
  searchParams
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams

  if (q) {
    return {
      description: `「${q}」の検索結果`,
      openGraph: {
        description: `「${q}」の検索結果`,
        title: `${q} - 検索結果 | Blog`,
        type: 'website',
        url: `${process.env.NEXT_PUBLIC_SITE_ORIGIN ?? 'https://ykzts.com'}/blog/search?q=${encodeURIComponent(q)}`
      },
      title: `${q} - 検索結果`
    }
  }

  return {
    description: 'ブログ記事を検索',
    openGraph: {
      description: 'ブログ記事を検索',
      title: 'Search | Blog',
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_SITE_ORIGIN ?? 'https://ykzts.com'}/blog/search`
    },
    title: 'Search'
  }
}

async function SearchContent({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = q?.trim() || ''

  let results: Awaited<ReturnType<typeof searchPosts>> = []
  let hasSearched = false

  if (query) {
    hasSearched = true
    try {
      results = await searchPosts(query, 10)
    } catch (error) {
      console.error('Search error:', error)
      // Results will be empty array on error
    }
  }

  return (
    <>
      <SearchForm className="mb-8" defaultQuery={query} />
      {hasSearched && <SearchResults query={query} results={results} />}
    </>
  )
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 font-bold text-3xl">ブログ記事検索</h1>
        <p className="mb-8 text-muted-foreground">
          キーワードを入力して、関連する記事を検索できます。
        </p>

        <Suspense fallback={<SearchForm className="mb-8" />}>
          <SearchContent searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  )
}

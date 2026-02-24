import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Header from '@/components/header'
import {
  getLatestPostDate,
  getPostCountByYear,
  getPostsByYear
} from '@/lib/supabase/posts'
import ArchiveList from './archive-list'

export const metadata: Metadata = {
  description: '年別アーカイブ - すべての記事を年ごとに表示',
  title: 'アーカイブ'
}

export default async function ArchivePage() {
  const draft = await draftMode()
  const isDraft = draft.isEnabled

  // Get the latest post's publication date
  const latestPostDate = await getLatestPostDate(isDraft)

  if (!latestPostDate) {
    // No posts exist
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <h1 className="mb-8 font-bold text-3xl">アーカイブ</h1>
          <p className="text-muted-foreground">記事がありません</p>
        </main>
      </>
    )
  }

  // Extract the year from the latest post
  const latestYear = new Date(latestPostDate).getUTCFullYear()

  // Fetch posts for the latest year
  const posts = await getPostsByYear(latestYear, isDraft)
  const count = await getPostCountByYear(latestYear, isDraft)

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 font-bold text-3xl">アーカイブ</h1>
        <ArchiveList
          initialYearData={{ count, posts, year: latestYear }}
          isDraft={isDraft}
        />
      </main>
    </>
  )
}

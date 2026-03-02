import { getSiteName } from '@ykzts/site-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import BlogPagination from '@/components/blog-pagination'
import Header from '@/components/header'
import PostCard from '@/components/post-card'
import { getPosts, getTotalPages } from '@/lib/supabase/posts'
import { getPublisherProfile } from '@/lib/supabase/profiles'

const siteName = getSiteName()

function buildDescription(profileName: string): string {
  return `${profileName}の個人ブログ。さまざまなトピックについて発信しています。`
}

export async function generateMetadata(): Promise<Metadata> {
  let description = buildDescription('このサイト')

  try {
    const profile = await getPublisherProfile()
    description = buildDescription(profile.name)
  } catch (error) {
    console.error('Failed to load profile for blog metadata:', error)
  }

  return {
    description,
    openGraph: {
      description,
      title: `Blog | ${siteName}`,
      type: 'website',
      url: '/blog'
    },
    title: {
      absolute: `Blog | ${siteName}`
    }
  }
}

export default async function HomePage() {
  const draft = await draftMode()
  const isDraft = draft.isEnabled

  const posts = await getPosts(1, isDraft)
  const totalPages = await getTotalPages(isDraft)

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard isDraft={isDraft} key={post.id} post={post} />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="mt-8">
            <BlogPagination currentPage={1} totalPages={totalPages} />
          </div>
        )}
      </main>
    </>
  )
}

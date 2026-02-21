import { portableTextToMarkdown } from '@ykzts/portable-text-utils'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import DateDisplay from '@/components/date-display'
import Header from '@/components/header'
import LinkButton from '@/components/link-button'
import VersionCompare from '@/components/version-compare'
import { getDateBasedUrl } from '@/lib/blog-urls'
import { DEFAULT_POST_TITLE } from '@/lib/constants'
import {
  getAllPosts,
  getPostBySlug,
  getPostVersions
} from '@/lib/supabase/posts'

type PageProps = {
  params: Promise<{
    year: string
    month: string
    day: string
    slug: string
  }>
}

export async function generateStaticParams() {
  const posts = await getAllPosts()

  if (posts.length === 0) {
    return [
      {
        day: '01',
        month: '01',
        slug: '_placeholder',
        year: '2024'
      }
    ]
  }

  return posts.map((post) => {
    const date = new Date(post.published_at)
    return {
      day: String(date.getUTCDate()).padStart(2, '0'),
      month: String(date.getUTCMonth() + 1).padStart(2, '0'),
      slug: post.slug,
      year: String(date.getUTCFullYear())
    }
  })
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const draft = await draftMode()
  const isDraft = draft.isEnabled

  const post = await getPostBySlug(slug, isDraft)

  if (!post) {
    return { title: 'Not Found' }
  }

  return {
    robots: { index: false },
    title: `編集履歴: ${post.title || DEFAULT_POST_TITLE}`
  }
}

export default async function PostHistoryPage({ params }: PageProps) {
  const { year, month, day, slug } = await params
  const draft = await draftMode()
  const isDraft = draft.isEnabled

  const post = await getPostBySlug(slug, isDraft)

  if (!post) {
    notFound()
  }

  // Validate URL date components match the post's published_at date
  if (post.published_at) {
    const publishedDate = new Date(post.published_at)
    const expectedYear = String(publishedDate.getUTCFullYear())
    const expectedMonth = String(publishedDate.getUTCMonth() + 1).padStart(
      2,
      '0'
    )
    const expectedDay = String(publishedDate.getUTCDate()).padStart(2, '0')

    if (
      year !== expectedYear ||
      month !== expectedMonth ||
      day !== expectedDay
    ) {
      notFound()
    }
  } else {
    // Draft posts with no published_at cannot be accessed via date-based URL
    notFound()
  }

  const versions = await getPostVersions(post.id)

  const postUrl = getDateBasedUrl(slug, post.published_at)

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-2 font-bold text-3xl">編集履歴</h1>
          <p className="mb-6 text-muted-foreground">
            <Link className="hover:underline" href={postUrl}>
              {post.title || DEFAULT_POST_TITLE}
            </Link>
          </p>

          {versions.length === 0 ? (
            <p className="text-muted-foreground">編集履歴がありません。</p>
          ) : versions.length === 1 ? (
            <ol className="space-y-4">
              {versions.map((version, index) => (
                <li
                  className="rounded border border-border p-4"
                  key={version.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          バージョン {version.version_number}
                        </span>
                        {index === 0 && (
                          <span className="rounded bg-primary px-2 py-0.5 text-primary-foreground text-xs">
                            最新
                          </span>
                        )}
                      </div>
                      <DateDisplay
                        className="mt-1 text-muted-foreground text-sm"
                        date={version.version_date}
                      />
                      {version.change_summary && (
                        <p className="mt-2 text-sm">{version.change_summary}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <>
              <p className="mb-4 text-muted-foreground text-sm">
                比較したい2つのバージョンを選択してください。
              </p>
              <VersionCompare
                versions={versions.map((version) => ({
                  change_summary: version.change_summary,
                  id: version.id,
                  markdownText: portableTextToMarkdown(version.content),
                  version_date: version.version_date,
                  version_number: version.version_number
                }))}
              />
            </>
          )}

          <div className="mt-8">
            <LinkButton href={postUrl} variant="outline">
              記事に戻る
            </LinkButton>
          </div>
        </div>
      </main>
    </>
  )
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import DateDisplay from '@/components/date-display'
import Header from '@/components/header'
import PortableTextBlock from '@/components/portable-text'
import TagList from '@/components/tag-list'
import { isPortableTextValue } from '@/lib/portable-text'
import { getAllPosts, getPostBySlug } from '@/lib/supabase/posts'

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

  return posts.map((post) => {
    const date = new Date(post.published_at)
    return {
      day: String(date.getDate()).padStart(2, '0'),
      month: String(date.getMonth() + 1).padStart(2, '0'),
      slug: post.slug,
      year: String(date.getFullYear())
    }
  })
}

export async function generateMetadata({
  params
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Not Found'
    }
  }

  return {
    description: post.excerpt || undefined,
    openGraph: {
      description: post.excerpt || undefined,
      title: post.title,
      type: 'article',
      url: `https://ykzts.com/blog/${params}`
    },
    title: post.title
  }
}

export default async function PostDetailPage({ params }: PageProps) {
  const { year, month, day, slug } = await params

  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  // Validate URL date components match the post's published_at date
  const publishedDate = new Date(post.published_at)
  const expectedYear = String(publishedDate.getFullYear())
  const expectedMonth = String(publishedDate.getMonth() + 1).padStart(2, '0')
  const expectedDay = String(publishedDate.getDate()).padStart(2, '0')

  if (year !== expectedYear || month !== expectedMonth || day !== expectedDay) {
    notFound()
  }

  // Validate content is valid PortableText
  if (!post.content || !isPortableTextValue(post.content)) {
    notFound()
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <article className="mx-auto max-w-3xl">
          <header className="mb-8">
            <h1 className="mb-4 font-bold text-4xl">{post.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <DateDisplay date={post.published_at} />
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="mt-4">
                <TagList className="flex flex-wrap gap-2" tags={post.tags} />
              </div>
            )}
          </header>
          <PortableTextBlock value={post.content} />
        </article>
      </main>
    </>
  )
}

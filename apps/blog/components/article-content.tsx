import { Suspense } from 'react'
import type { Heading } from '@/lib/extract-headings'
import type { PortableTextValue } from '@/lib/portable-text'
import { getSimilarPosts } from '@/lib/supabase/posts'
import ArticleHeader from './article-header'
import PortableTextBlock from './portable-text'
import PostNavigation from './post-navigation'
import SimilarPosts from './similar-posts'
import SimilarPostsSkeleton from './similar-posts-skeleton'
import TableOfContents from './table-of-contents'

interface ArticleContentProps {
  authorName: string
  content: PortableTextValue
  headings: Heading[]
  nextPost: { slug: string; title: string; published_at: string } | null
  postId: string
  previousPost: { slug: string; title: string; published_at: string } | null
  publishedAt: string
  tags?: string[] | null
  title: string
  versionDate?: string | null
}

export default function ArticleContent({
  title,
  authorName,
  publishedAt,
  versionDate,
  tags,
  content,
  headings,
  nextPost,
  previousPost,
  postId
}: ArticleContentProps) {
  return (
    <article className="min-w-0 max-w-3xl">
      <ArticleHeader
        authorName={authorName}
        publishedAt={publishedAt}
        tags={tags}
        title={title}
        versionDate={versionDate}
      />
      {/* Mobile ToC - only visible on mobile */}
      {headings.length > 0 && (
        <div className="lg:hidden">
          <TableOfContents headings={headings} variant="mobile" />
        </div>
      )}
      <PortableTextBlock value={content} />
      <PostNavigation nextPost={nextPost} previousPost={previousPost} />
      <Suspense fallback={<SimilarPostsSkeleton />}>
        <SimilarPostsSection postId={postId} />
      </Suspense>
    </article>
  )
}

async function SimilarPostsSection({ postId }: { postId: string }) {
  const similarPosts = await getSimilarPosts(postId, 3, 0.5)
  return <SimilarPosts posts={similarPosts} />
}

import type { Heading } from '@/lib/extract-headings'
import type { PortableTextValue } from '@/lib/portable-text'
import ArticleHeader from './article-header'
import PortableTextBlock from './portable-text'
import PostNavigation from './post-navigation'
import TableOfContents from './table-of-contents'

interface ArticleContentProps {
  title: string
  authorName: string
  publishedAt: string
  versionDate?: string | null
  tags?: string[] | null
  content: PortableTextValue
  headings: Heading[]
  nextPost: { slug: string; title: string; published_at: string } | null
  previousPost: { slug: string; title: string; published_at: string } | null
  className?: string
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
  className
}: ArticleContentProps) {
  return (
    <article className={className}>
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
    </article>
  )
}

import type { Heading } from '@/lib/extract-headings'
import type { PortableTextValue } from '@/lib/portable-text'
import ArticleHeader from './article-header'
import PortableTextBlock from './portable-text'
import TableOfContents from './table-of-contents'

interface ArticleContentProps {
  authorName: string
  className?: string
  content: PortableTextValue
  headings: Heading[]
  publishedAt: string
  tags?: string[] | null
  title: string
  versionDate?: string | null
}

export default function ArticleContent({
  authorName,
  className,
  content,
  headings,
  publishedAt,
  tags,
  title,
  versionDate
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
    </article>
  )
}

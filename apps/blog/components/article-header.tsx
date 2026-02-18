import DateDisplay from './date-display'
import TagList from './tag-list'

interface ArticleHeaderProps {
  title: string
  authorName: string
  publishedAt: string
  versionDate?: string | null
  tags?: string[] | null
}

export default function ArticleHeader({
  title,
  authorName,
  publishedAt,
  versionDate,
  tags
}: ArticleHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="mb-4 font-bold text-4xl">{title}</h1>
      <div className="flex flex-col gap-2 text-muted-foreground text-sm">
        <div className="flex items-center gap-4">
          <span>著者: {authorName}</span>
          <DateDisplay date={publishedAt} />
        </div>
        {versionDate && versionDate !== publishedAt && (
          <div>
            更新: <DateDisplay date={versionDate} />
          </div>
        )}
      </div>
      {tags && tags.length > 0 && (
        <div className="mt-4">
          <TagList className="flex flex-wrap gap-2" tags={tags} />
        </div>
      )}
    </header>
  )
}

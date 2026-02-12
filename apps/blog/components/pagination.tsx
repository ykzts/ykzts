import { Button } from '@ykzts/ui/components/button'
import Link from 'next/link'

type PaginationProps = {
  currentPage: number
  totalPages: number
  baseUrl?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl = '/page'
}: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const prevPage = currentPage > 1 ? currentPage - 1 : null
  const nextPage = currentPage < totalPages ? currentPage + 1 : null

  const prevUrl = prevPage === 1 ? '/' : `${baseUrl}/${prevPage}`
  const nextUrl = nextPage ? `${baseUrl}/${nextPage}` : null

  return (
    <nav
      aria-label="ページネーション"
      className="flex items-center justify-center gap-2"
    >
      {prevPage ? (
        <Button asChild variant="outline">
          <Link href={prevUrl}>前のページ</Link>
        </Button>
      ) : (
        <Button disabled variant="outline">
          前のページ
        </Button>
      )}

      <span className="text-muted-foreground text-sm">
        {currentPage} / {totalPages}
      </span>

      {nextUrl ? (
        <Button asChild variant="outline">
          <Link href={nextUrl}>次のページ</Link>
        </Button>
      ) : (
        <Button disabled variant="outline">
          次のページ
        </Button>
      )}
    </nav>
  )
}

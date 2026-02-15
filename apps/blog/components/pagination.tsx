'use client'

import { buttonVariants } from '@ykzts/ui/components/button'
import { cn } from '@ykzts/ui/lib/utils'
import type { Route } from 'next'
import NextLink from 'next/link'

type PaginationProps = {
  currentPage: number
  totalPages: number
  baseUrl?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl = '/blog/page'
}: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const prevPage = currentPage > 1 ? currentPage - 1 : null
  const nextPage = currentPage < totalPages ? currentPage + 1 : null

  // Derive page 1 URL from baseUrl by removing trailing '/page'
  const baseUrlPage1 = baseUrl.endsWith('/page')
    ? (baseUrl.slice(0, -'/page'.length) as Route)
    : ('/blog' as Route)

  const prevUrl =
    prevPage === 1 ? baseUrlPage1 : (`${baseUrl}/${prevPage}` as Route)
  const nextUrl = nextPage ? (`${baseUrl}/${nextPage}` as Route) : null

  return (
    <nav
      aria-label="ページネーション"
      className="flex items-center justify-center gap-2"
    >
      {prevPage ? (
        <NextLink
          className={cn(buttonVariants({ variant: 'outline' }))}
          href={prevUrl}
        >
          前のページ
        </NextLink>
      ) : (
        <button
          className={cn(buttonVariants({ variant: 'outline' }))}
          disabled
          type="button"
        >
          前のページ
        </button>
      )}

      <span className="text-muted-foreground text-sm">
        {currentPage} / {totalPages}
      </span>

      {nextUrl ? (
        <NextLink
          className={cn(buttonVariants({ variant: 'outline' }))}
          href={nextUrl}
        >
          次のページ
        </NextLink>
      ) : (
        <button
          className={cn(buttonVariants({ variant: 'outline' }))}
          disabled
          type="button"
        >
          次のページ
        </button>
      )}
    </nav>
  )
}

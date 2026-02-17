'use client'

import {
  Pagination,
  PaginationContent,
  PaginationDisabled,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@ykzts/ui/components/pagination'
import { getVisiblePages } from '@ykzts/ui/lib/pagination-utils'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import type { Route } from 'next'

type BlogPaginationProps = {
  currentPage: number
  totalPages: number
  baseUrl?: string
}

export default function BlogPagination({
  currentPage,
  totalPages,
  baseUrl = '/blog/page'
}: BlogPaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  // Derive page 1 URL from baseUrl
  // If baseUrl ends with '/page', strip it; otherwise use baseUrl as-is
  // This handles both '/blog/page' -> '/blog' and '/blog/tags/foo/page' -> '/blog/tags/foo'
  const baseUrlPage1 = baseUrl.endsWith('/page')
    ? (baseUrl.slice(0, -'/page'.length) as Route)
    : (baseUrl as Route)

  const getPageUrl = (page: number): Route => {
    if (page === 1) {
      return baseUrlPage1
    }
    return `${baseUrl}/${page}` as Route
  }

  // Calculate page numbers to display using shared utility
  const { pages, showStartEllipsis, showEndEllipsis } = getVisiblePages(
    currentPage,
    totalPages
  )

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          {currentPage > 1 ? (
            <PaginationPrevious
              href={getPageUrl(currentPage - 1)}
              text="前のページ"
            />
          ) : (
            <PaginationDisabled
              icon={<ChevronLeftIcon data-icon="inline-start" />}
            >
              <span className="hidden sm:block">前のページ</span>
            </PaginationDisabled>
          )}
        </PaginationItem>

        {showStartEllipsis && (
          <>
            <PaginationItem>
              <PaginationLink href={getPageUrl(1)}>1</PaginationLink>
            </PaginationItem>
            {pages[0] > 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
          </>
        )}

        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href={getPageUrl(page)}
              isActive={page === currentPage}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {showEndEllipsis && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink href={getPageUrl(totalPages)}>
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          {currentPage < totalPages ? (
            <PaginationNext
              href={getPageUrl(currentPage + 1)}
              text="次のページ"
            />
          ) : (
            <PaginationDisabled
              icon={<ChevronRightIcon data-icon="inline-end" />}
            >
              <span className="hidden sm:block">次のページ</span>
            </PaginationDisabled>
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

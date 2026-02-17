'use client'

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@ykzts/ui/components/pagination'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import type { Route } from 'next'

type BlogPaginationProps = {
  currentPage: number
  totalPages: number
  baseUrl?: string
}

function DisabledPaginationButton({
  children,
  icon
}: {
  children: React.ReactNode
  icon: React.ReactNode
}) {
  return (
    <span className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-transparent px-4 font-medium text-muted-foreground text-sm transition-colors">
      {icon}
      {children}
    </span>
  )
}

export default function BlogPagination({
  currentPage,
  totalPages,
  baseUrl = '/blog/page'
}: BlogPaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  // Derive page 1 URL from baseUrl by removing trailing '/page'
  const baseUrlPage1 = baseUrl.endsWith('/page')
    ? (baseUrl.slice(0, -'/page'.length) as Route)
    : ('/blog' as Route)

  const getPageUrl = (page: number): Route => {
    if (page === 1) {
      return baseUrlPage1
    }
    return `${baseUrl}/${page}` as Route
  }

  // Calculate page numbers to display
  const pages: number[] = []
  const maxVisible = 5
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  const endPage = Math.min(totalPages, startPage + maxVisible - 1)

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  const showStartEllipsis = startPage > 1
  const showEndEllipsis = endPage < totalPages

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
            <DisabledPaginationButton
              icon={<ChevronLeftIcon data-icon="inline-start" />}
            >
              <span className="hidden sm:block">前のページ</span>
            </DisabledPaginationButton>
          )}
        </PaginationItem>

        {showStartEllipsis && (
          <>
            <PaginationItem>
              <PaginationLink href={getPageUrl(1)}>1</PaginationLink>
            </PaginationItem>
            {startPage > 2 && (
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
            {endPage < totalPages - 1 && (
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
            <DisabledPaginationButton
              icon={<ChevronRightIcon data-icon="inline-end" />}
            >
              <span className="hidden sm:block">次のページ</span>
            </DisabledPaginationButton>
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

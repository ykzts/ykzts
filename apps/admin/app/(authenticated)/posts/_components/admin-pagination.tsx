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
import { useRouter, useSearchParams } from 'next/navigation'

type AdminPaginationProps = {
  currentPage: number
  totalPages: number
}

export function AdminPagination({
  currentPage,
  totalPages
}: AdminPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }
    router.push(`/posts?${params.toString()}`)
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
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          {currentPage > 1 ? (
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault()
                handlePageChange(currentPage - 1)
              }}
              text="前へ"
            />
          ) : (
            <span className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-transparent px-4 font-medium text-muted-foreground text-sm transition-colors">
              <span className="hidden sm:block">前へ</span>
            </span>
          )}
        </PaginationItem>

        {showStartEllipsis && (
          <>
            <PaginationItem>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  handlePageChange(1)
                }}
              >
                1
              </PaginationLink>
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
              href="#"
              isActive={page === currentPage}
              onClick={(e) => {
                e.preventDefault()
                handlePageChange(page)
              }}
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
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  handlePageChange(totalPages)
                }}
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          {currentPage < totalPages ? (
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault()
                handlePageChange(currentPage + 1)
              }}
              text="次へ"
            />
          ) : (
            <span className="inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-transparent px-4 font-medium text-muted-foreground text-sm transition-colors">
              <span className="hidden sm:block">次へ</span>
            </span>
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

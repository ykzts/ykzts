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

  // Early return for single page
  if (totalPages <= 1) {
    return null
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }
    const queryString = params.toString()
    router.push(queryString ? `/posts?${queryString}` : '/posts')
  }

  // Calculate page numbers to display using shared utility
  const { pages, showStartEllipsis, showEndEllipsis } = getVisiblePages(
    currentPage,
    totalPages
  )

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
            <PaginationDisabled
              icon={<ChevronLeftIcon data-icon="inline-start" />}
            >
              <span className="hidden sm:block">前へ</span>
            </PaginationDisabled>
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
            {pages[pages.length - 1] < totalPages - 1 && (
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
            <PaginationDisabled
              icon={<ChevronRightIcon data-icon="inline-end" />}
            >
              <span className="hidden sm:block">次へ</span>
            </PaginationDisabled>
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

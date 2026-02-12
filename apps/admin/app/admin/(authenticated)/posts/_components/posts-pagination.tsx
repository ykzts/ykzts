'use client'

import { Button } from '@ykzts/ui/components/button'
import { useRouter, useSearchParams } from 'next/navigation'

type PostsPaginationProps = {
  currentPage: number
  totalPages: number
}

export function PostsPagination({
  currentPage,
  totalPages
}: PostsPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }
    router.push(`/admin/posts?${params.toString()}`)
  }

  const pages = []
  const maxVisible = 5
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  const endPage = Math.min(totalPages, startPage + maxVisible - 1)

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <Button
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        size="sm"
        variant="outline"
      >
        前へ
      </Button>

      {startPage > 1 && (
        <>
          <Button
            onClick={() => handlePageChange(1)}
            size="sm"
            variant="outline"
          >
            1
          </Button>
          {startPage > 2 && <span className="px-2">...</span>}
        </>
      )}

      {pages.map((page) => (
        <Button
          key={page}
          onClick={() => handlePageChange(page)}
          size="sm"
          variant={page === currentPage ? 'default' : 'outline'}
        >
          {page}
        </Button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="px-2">...</span>}
          <Button
            onClick={() => handlePageChange(totalPages)}
            size="sm"
            variant="outline"
          >
            {totalPages}
          </Button>
        </>
      )}

      <Button
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        size="sm"
        variant="outline"
      >
        次へ
      </Button>
    </div>
  )
}

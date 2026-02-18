export type VisiblePages = {
  pages: number[]
  showEndEllipsis: boolean
  showStartEllipsis: boolean
}

/**
 * Calculate which page numbers to display in pagination
 * @param currentPage - The current active page
 * @param totalPages - Total number of pages
 * @param maxVisible - Maximum number of page buttons to show (default: 5)
 * @returns Object with pages array and ellipsis flags
 */
export function getVisiblePages(
  currentPage: number,
  totalPages: number,
  maxVisible = 5
): VisiblePages {
  const pages: number[] = []

  // Calculate start and end of visible range, centered on current page
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  const endPage = Math.min(totalPages, startPage + maxVisible - 1)

  // Adjust start if we're near the end
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1)
  }

  // Build pages array
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return {
    pages,
    showEndEllipsis: endPage < totalPages,
    showStartEllipsis: startPage > 1
  }
}

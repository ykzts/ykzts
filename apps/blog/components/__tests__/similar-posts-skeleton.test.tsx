import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SimilarPostsSkeleton from '../similar-posts-skeleton'

describe('SimilarPostsSkeleton', () => {
  it('renders with default count of 3 skeleton cards', () => {
    const { container } = render(<SimilarPostsSkeleton />)

    const cards = container.querySelectorAll('[aria-hidden="true"]')
    expect(cards).toHaveLength(3)
  })

  it('renders custom count of skeleton cards', () => {
    const { container } = render(<SimilarPostsSkeleton count={5} />)

    const cards = container.querySelectorAll('[aria-hidden="true"]')
    expect(cards).toHaveLength(5)
  })

  it('has proper ARIA attributes for loading state', () => {
    const { container } = render(<SimilarPostsSkeleton />)

    const loadingContainer = container.querySelector('[aria-live="polite"]')
    expect(loadingContainer).toBeInTheDocument()
  })

  it('marks skeleton cards as aria-hidden', () => {
    const { container } = render(<SimilarPostsSkeleton />)

    const cards = container.querySelectorAll('[aria-hidden="true"]')
    expect(cards.length).toBeGreaterThan(0)
  })

  it('applies responsive grid classes', () => {
    const { container } = render(<SimilarPostsSkeleton />)

    const grid = container.querySelector('.grid')
    expect(grid).toHaveClass('sm:grid-cols-2', 'lg:grid-cols-3')
  })
})

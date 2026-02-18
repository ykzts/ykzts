import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SimilarPosts from '../similar-posts'

describe('SimilarPosts', () => {
  const mockPosts = [
    {
      excerpt: 'This is a test post about React',
      id: '1',
      published_at: '2024-01-15T00:00:00Z',
      similarity: 0.85,
      slug: 'test-post-1',
      tags: ['React', 'TypeScript'],
      title: 'Test Post 1'
    },
    {
      excerpt: 'This is another test post',
      id: '2',
      published_at: '2024-02-20T00:00:00Z',
      similarity: 0.75,
      slug: 'test-post-2',
      tags: ['Next.js'],
      title: 'Test Post 2'
    },
    {
      excerpt: null,
      id: '3',
      published_at: '2024-03-10T00:00:00Z',
      similarity: 0.65,
      slug: 'test-post-3',
      tags: null,
      title: 'Test Post 3'
    }
  ]

  it('renders section heading', () => {
    render(<SimilarPosts posts={mockPosts} />)

    expect(
      screen.getByRole('heading', { level: 2, name: '関連記事' })
    ).toBeInTheDocument()
  })

  it('renders all similar posts', () => {
    render(<SimilarPosts posts={mockPosts} />)

    expect(screen.getByText('Test Post 1')).toBeInTheDocument()
    expect(screen.getByText('Test Post 2')).toBeInTheDocument()
    expect(screen.getByText('Test Post 3')).toBeInTheDocument()
  })

  it('renders post excerpts when available', () => {
    render(<SimilarPosts posts={mockPosts} />)

    expect(
      screen.getByText('This is a test post about React')
    ).toBeInTheDocument()
    expect(screen.getByText('This is another test post')).toBeInTheDocument()
  })

  it('renders post tags when available', () => {
    render(<SimilarPosts posts={mockPosts} />)

    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('Next.js')).toBeInTheDocument()
  })

  it('renders post links with correct URLs', () => {
    render(<SimilarPosts posts={mockPosts} />)

    const link1 = screen.getByRole('link', { name: 'Test Post 1' })
    expect(link1).toHaveAttribute('href', '/blog/2024/01/15/test-post-1')

    const link2 = screen.getByRole('link', { name: 'Test Post 2' })
    expect(link2).toHaveAttribute('href', '/blog/2024/02/20/test-post-2')

    const link3 = screen.getByRole('link', { name: 'Test Post 3' })
    expect(link3).toHaveAttribute('href', '/blog/2024/03/10/test-post-3')
  })

  it('returns null when posts array is empty', () => {
    const { container } = render(<SimilarPosts posts={[]} />)

    expect(container.firstChild).toBeNull()
  })

  it('returns null when posts is undefined', () => {
    const { container } = render(<SimilarPosts posts={undefined as never} />)

    expect(container.firstChild).toBeNull()
  })

  it('applies responsive grid classes', () => {
    const { container } = render(<SimilarPosts posts={mockPosts} />)

    const grid = container.querySelector('.grid')
    expect(grid).toHaveClass('sm:grid-cols-2', 'lg:grid-cols-3')
  })

  it('has proper ARIA labeling', () => {
    render(<SimilarPosts posts={mockPosts} />)

    const section = screen.getByRole('region', { name: '関連記事' })
    expect(section).toBeInTheDocument()
  })
})

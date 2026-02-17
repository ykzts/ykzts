import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import WorksList from '../works-list'

const mockWorks = [
  {
    content: [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Work 1 content' }]
      }
    ],
    slug: 'work-1',
    starts_at: '2024-01-01',
    title: 'Work 1'
  },
  {
    content: [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Work 2 content' }]
      }
    ],
    slug: 'work-2',
    starts_at: '2024-01-02',
    title: 'Work 2'
  },
  {
    content: [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Work 3 content' }]
      }
    ],
    slug: 'work-3',
    starts_at: '2024-01-03',
    title: 'Work 3'
  },
  {
    content: [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Work 4 content' }]
      }
    ],
    slug: 'work-4',
    starts_at: '2024-01-04',
    title: 'Work 4'
  },
  {
    content: [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Work 5 content' }]
      }
    ],
    slug: 'work-5',
    starts_at: '2024-01-05',
    title: 'Work 5'
  },
  {
    content: [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Work 6 content' }]
      }
    ],
    slug: 'work-6',
    starts_at: '2024-01-06',
    title: 'Work 6'
  }
]

describe('WorksList Component', () => {
  it('displays only initial works when count is less than limit', () => {
    const fewWorks = mockWorks.slice(0, 3)
    render(<WorksList initialDisplayCount={5} works={fewWorks} />)

    expect(screen.getByText('Work 1')).toBeInTheDocument()
    expect(screen.getByText('Work 2')).toBeInTheDocument()
    expect(screen.getByText('Work 3')).toBeInTheDocument()
    expect(screen.queryByText('もっと見る')).not.toBeInTheDocument()
  })

  it('displays initial works and "Show More" button when count exceeds limit', () => {
    render(<WorksList initialDisplayCount={5} works={mockWorks} />)

    expect(screen.getByText('Work 1')).toBeInTheDocument()
    expect(screen.getByText('Work 5')).toBeInTheDocument()
    expect(screen.queryByText('Work 6')).not.toBeInTheDocument()
    expect(screen.getByText('もっと見る')).toBeInTheDocument()
  })

  it('displays all works when "Show More" button is clicked', async () => {
    const user = userEvent.setup()
    render(<WorksList initialDisplayCount={5} works={mockWorks} />)

    const showMoreButton = screen.getByText('もっと見る')
    await user.click(showMoreButton)

    expect(screen.getByText('Work 1')).toBeInTheDocument()
    expect(screen.getByText('Work 6')).toBeInTheDocument()
    expect(screen.queryByText('もっと見る')).not.toBeInTheDocument()
  })

  it('renders work articles with correct attributes', () => {
    render(<WorksList initialDisplayCount={5} works={mockWorks.slice(0, 2)} />)

    const articles = screen
      .getAllByRole('article')
      .filter((article) => article.id === 'work-1' || article.id === 'work-2')

    expect(articles).toHaveLength(2)
    expect(articles[0]).toHaveAttribute('id', 'work-1')
    expect(articles[1]).toHaveAttribute('id', 'work-2')
  })

  it('uses custom initial display count', () => {
    render(<WorksList initialDisplayCount={3} works={mockWorks} />)

    expect(screen.getByText('Work 1')).toBeInTheDocument()
    expect(screen.getByText('Work 3')).toBeInTheDocument()
    expect(screen.queryByText('Work 4')).not.toBeInTheDocument()
    expect(screen.getByText('もっと見る')).toBeInTheDocument()
  })

  it('has accessible button with aria-label', () => {
    render(<WorksList initialDisplayCount={5} works={mockWorks} />)

    const showMoreButton = screen.getByText('もっと見る')
    expect(showMoreButton).toHaveAttribute('aria-label', 'もっと見る')
    expect(showMoreButton).toHaveAttribute('type', 'button')
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import WorksList from '../works-list'

const mockPush = vi.fn()
const mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams
}))

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
    title: 'Work 1',
    work_technologies: [
      { technology: { name: 'React' }, technology_id: 'tech-1' }
    ],
    work_urls: [
      {
        id: 'url-1',
        label: 'GitHub',
        sort_order: 0,
        url: 'https://github.com/example/work-1'
      }
    ]
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
    title: 'Work 2',
    work_technologies: [
      { technology: { name: 'TypeScript' }, technology_id: 'tech-2' }
    ],
    work_urls: []
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
    title: 'Work 3',
    work_technologies: [
      { technology: { name: 'React' }, technology_id: 'tech-1' },
      { technology: { name: 'TypeScript' }, technology_id: 'tech-2' }
    ],
    work_urls: [
      {
        id: 'url-2',
        label: 'Demo',
        sort_order: 0,
        url: 'https://example.com/work-3'
      },
      {
        id: 'url-3',
        label: 'GitHub',
        sort_order: 1,
        url: 'https://github.com/example/work-3'
      }
    ]
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
    title: 'Work 4',
    work_technologies: [],
    work_urls: []
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
    title: 'Work 5',
    work_technologies: [],
    work_urls: []
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
    title: 'Work 6',
    work_technologies: [],
    work_urls: []
  }
]

describe('WorksList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams.delete('technology')
  })

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

  it('has accessible button with proper type', () => {
    render(<WorksList initialDisplayCount={5} works={mockWorks} />)

    const showMoreButton = screen.getByText('もっと見る')
    expect(showMoreButton).toHaveAttribute('type', 'button')
  })

  it('renders work_urls as links', () => {
    render(<WorksList initialDisplayCount={5} works={mockWorks.slice(0, 1)} />)

    const link = screen.getByRole('link', { name: 'GitHub' })
    expect(link).toHaveAttribute('href', 'https://github.com/example/work-1')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('does not render URL section when work has no urls', () => {
    render(<WorksList initialDisplayCount={5} works={mockWorks.slice(1, 2)} />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders multiple work_urls in sort_order', () => {
    render(<WorksList initialDisplayCount={5} works={mockWorks.slice(2, 3)} />)

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveTextContent('Demo')
    expect(links[1]).toHaveTextContent('GitHub')
  })

  it('shows technology filter buttons when works have technologies', () => {
    render(<WorksList initialDisplayCount={5} works={mockWorks.slice(0, 3)} />)

    expect(screen.getByRole('button', { name: 'すべて' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'React' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'TypeScript' })
    ).toBeInTheDocument()
  })

  it('does not show filter buttons when no technologies exist', () => {
    render(<WorksList initialDisplayCount={5} works={mockWorks.slice(3)} />)

    expect(
      screen.queryByRole('button', { name: 'すべて' })
    ).not.toBeInTheDocument()
  })

  it('filters works when technology button is clicked', async () => {
    const user = userEvent.setup()
    render(<WorksList initialDisplayCount={5} works={mockWorks.slice(0, 3)} />)

    const reactButton = screen.getByRole('button', { name: 'React' })
    await user.click(reactButton)

    expect(mockPush).toHaveBeenCalledWith('/?technology=React', {
      scroll: false
    })
  })

  it('clears technology filter when "すべて" button is clicked', async () => {
    mockSearchParams.set('technology', 'React')
    const user = userEvent.setup()
    render(<WorksList initialDisplayCount={5} works={mockWorks.slice(0, 3)} />)

    const allButton = screen.getByRole('button', { name: 'すべて' })
    await user.click(allButton)

    expect(mockPush).toHaveBeenCalledWith('/', { scroll: false })
  })

  it('renders technology tags on work articles', () => {
    render(<WorksList initialDisplayCount={5} works={mockWorks.slice(0, 1)} />)

    const reactElements = screen.getAllByText('React')
    expect(reactElements.length).toBeGreaterThanOrEqual(1)
    const tag = reactElements.find((el) => el.tagName.toLowerCase() === 'span')
    expect(tag).toBeInTheDocument()
  })
})

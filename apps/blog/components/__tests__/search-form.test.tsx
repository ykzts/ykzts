import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SearchForm from '../search-form'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn()
  }
}))

// Mock fetch
global.fetch = vi.fn()

describe('SearchForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as ReturnType<typeof vi.fn>).mockClear()
  })

  it('renders search form with input and button', () => {
    render(<SearchForm />)

    expect(
      screen.getByPlaceholderText('キーワードを入力...')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /検索/ })).toBeInTheDocument()
  })

  it('shows error toast when submitting empty query', async () => {
    const user = userEvent.setup()
    const { toast } = await import('sonner')
    render(<SearchForm />)

    const submitButton = screen.getByRole('button', { name: /検索/ })
    await user.click(submitButton)

    expect(toast.error).toHaveBeenCalledWith('検索キーワードを入力してください')
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('submits search query and displays results', async () => {
    const user = userEvent.setup()
    const mockResults = [
      {
        excerpt: 'Test excerpt',
        id: '1',
        published_at: '2024-01-01T00:00:00Z',
        similarity: 0.85,
        slug: 'test-post',
        tags: ['test'],
        title: 'Test Post'
      }
    ]

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      json: async () => ({
        count: 1,
        query: 'React',
        results: mockResults
      }),
      ok: true
    })

    render(<SearchForm />)

    const input = screen.getByPlaceholderText('キーワードを入力...')
    await user.type(input, 'React')

    const submitButton = screen.getByRole('button', { name: /検索/ })
    await user.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/blog/search', {
        body: JSON.stringify({ limit: 10, query: 'React' }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST'
      })
    })

    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument()
    })
  })

  it('shows info toast when no results found', async () => {
    const user = userEvent.setup()
    const { toast } = await import('sonner')

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      json: async () => ({
        count: 0,
        query: 'nonexistent',
        results: []
      }),
      ok: true
    })

    render(<SearchForm />)

    const input = screen.getByPlaceholderText('キーワードを入力...')
    await user.type(input, 'nonexistent')

    const submitButton = screen.getByRole('button', { name: /検索/ })
    await user.click(submitButton)

    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith(
        '該当する記事が見つかりませんでした'
      )
    })
  })

  it('shows error toast when API request fails', async () => {
    const user = userEvent.setup()
    const { toast } = await import('sonner')

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      json: async () => ({ error: 'Search failed' }),
      ok: false
    })

    render(<SearchForm />)

    const input = screen.getByPlaceholderText('キーワードを入力...')
    await user.type(input, 'test')

    const submitButton = screen.getByRole('button', { name: /検索/ })
    await user.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Search failed')
    })
  })

  it('disables form during search', async () => {
    const user = userEvent.setup()

    ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                json: async () => ({ count: 0, query: 'test', results: [] }),
                ok: true
              }),
            100
          )
        )
    )

    render(<SearchForm />)

    const input = screen.getByPlaceholderText('キーワードを入力...')
    await user.type(input, 'test')

    const submitButton = screen.getByRole('button', { name: /検索/ })
    await user.click(submitButton)

    expect(screen.getByRole('button', { name: /検索中/ })).toBeDisabled()
    expect(input).toBeDisabled()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /検索/ })).toBeEnabled()
    })
  })
})

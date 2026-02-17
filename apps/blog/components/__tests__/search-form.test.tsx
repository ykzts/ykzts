import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SearchForm from '../search-form'

// Mock Next.js router
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

describe('SearchForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders search form with input and button', () => {
    render(<SearchForm />)

    expect(
      screen.getByPlaceholderText('キーワードを入力...')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /検索/ })).toBeInTheDocument()
  })

  it('does not navigate when submitting empty query', async () => {
    const user = userEvent.setup()
    render(<SearchForm />)

    const submitButton = screen.getByRole('button', { name: /検索/ })
    await user.click(submitButton)

    expect(mockPush).not.toHaveBeenCalled()
  })

  it('navigates to search page with query param on submit', async () => {
    const user = userEvent.setup()
    render(<SearchForm />)

    const input = screen.getByPlaceholderText('キーワードを入力...')
    await user.type(input, 'React')

    const submitButton = screen.getByRole('button', { name: /検索/ })
    await user.click(submitButton)

    expect(mockPush).toHaveBeenCalledWith('/blog/search?q=React')
  })

  it('uses defaultQuery prop to set initial value', () => {
    render(<SearchForm defaultQuery="TypeScript" />)

    const input = screen.getByPlaceholderText('キーワードを入力...')
    expect(input).toHaveValue('TypeScript')
  })

  it('trims whitespace from query before navigation', async () => {
    const user = userEvent.setup()
    render(<SearchForm />)

    const input = screen.getByPlaceholderText('キーワードを入力...')
    await user.type(input, '  Next.js  ')

    const submitButton = screen.getByRole('button', { name: /検索/ })
    await user.click(submitButton)

    expect(mockPush).toHaveBeenCalledWith('/blog/search?q=Next.js')
  })

  it('applies custom className', () => {
    const { container } = render(<SearchForm className="custom-class" />)

    const form = container.querySelector('form')
    expect(form).toHaveClass('custom-class')
  })
})

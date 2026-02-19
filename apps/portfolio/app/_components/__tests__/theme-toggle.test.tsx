import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

const mockSetTheme = vi.fn()
let mockResolvedTheme = 'light'

vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: mockResolvedTheme,
    setTheme: mockSetTheme
  })
}))

// Import after mocks are set up
const { default: ThemeToggle } = await import('../theme-toggle')

describe('ThemeToggle', () => {
  it('renders without crashing', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('shows moon icon and dark mode label in light mode', () => {
    mockResolvedTheme = 'light'
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: 'ダークモードに切り替える' })
    expect(button).toBeInTheDocument()
  })

  it('shows sun icon and light mode label in dark mode', () => {
    mockResolvedTheme = 'dark'
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: 'ライトモードに切り替える' })
    expect(button).toBeInTheDocument()
  })

  it('calls setTheme with dark when in light mode', async () => {
    mockResolvedTheme = 'light'
    const user = userEvent.setup()
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: 'ダークモードに切り替える' })
    await user.click(button)

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('calls setTheme with light when in dark mode', async () => {
    mockResolvedTheme = 'dark'
    const user = userEvent.setup()
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: 'ライトモードに切り替える' })
    await user.click(button)

    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })
})

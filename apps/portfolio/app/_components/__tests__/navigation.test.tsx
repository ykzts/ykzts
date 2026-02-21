import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: 'light',
    setTheme: vi.fn()
  })
}))

const { default: Navigation } = await import('../navigation')

describe('Navigation', () => {
  it('shows Works link when hasWorks is true', () => {
    render(<Navigation hasWorks={true} />)

    expect(screen.getAllByText('Works').length).toBeGreaterThan(0)
  })

  it('hides Works link when hasWorks is false', () => {
    render(<Navigation hasWorks={false} />)

    expect(screen.queryByText('Works')).not.toBeInTheDocument()
  })

  it('shows Works link by default when hasWorks is not provided', () => {
    render(<Navigation />)

    expect(screen.getAllByText('Works').length).toBeGreaterThan(0)
  })

  it('always shows About and Contact links regardless of hasWorks', () => {
    render(<Navigation hasWorks={false} />)

    expect(screen.getAllByText('About').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Contact').length).toBeGreaterThan(0)
  })
})

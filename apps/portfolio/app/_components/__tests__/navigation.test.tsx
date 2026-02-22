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

  it('shows About link when hasAbout is true', () => {
    render(<Navigation hasAbout={true} />)

    expect(screen.getAllByText('About').length).toBeGreaterThan(0)
  })

  it('hides About link when hasAbout is false', () => {
    render(<Navigation hasAbout={false} />)

    expect(screen.queryByText('About')).not.toBeInTheDocument()
  })

  it('shows About link by default when hasAbout is not provided', () => {
    render(<Navigation />)

    expect(screen.getAllByText('About').length).toBeGreaterThan(0)
  })

  it('always shows Contact link regardless of hasAbout and hasWorks', () => {
    render(<Navigation hasAbout={false} hasWorks={false} />)

    expect(screen.getAllByText('Contact').length).toBeGreaterThan(0)
  })
})

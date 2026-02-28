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
  it('should render site-wide navigation links', () => {
    render(<Navigation />)

    expect(screen.getAllByText('About').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Blog').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Contact').length).toBeGreaterThan(0)
  })

  it('renders Blog as a trigger with sub-items (Archive, Search)', () => {
    render(<Navigation />)

    // "Blog" should be a button (trigger), not a link, because it has children
    const blogTrigger = screen.getByRole('button', { name: /blog/i })
    expect(blogTrigger).toBeDefined()
  })

  it('shows Works link when hasWorks is true', () => {
    render(<Navigation hasWorks={true} />)

    expect(screen.getAllByText('Works').length).toBeGreaterThan(0)
  })

  it('hides Works link when hasWorks is false', () => {
    render(<Navigation hasWorks={false} />)

    expect(screen.queryByText('Works')).not.toBeInTheDocument()
  })

  it('shows About link when hasAbout is true', () => {
    render(<Navigation hasAbout={true} />)

    expect(screen.getAllByText('About').length).toBeGreaterThan(0)
  })

  it('hides About link when hasAbout is false', () => {
    render(<Navigation hasAbout={false} />)

    expect(screen.queryByText('About')).not.toBeInTheDocument()
  })

  it('should have accessible menu button for mobile', () => {
    render(<Navigation />)

    const menuButton = screen.getByRole('button', { name: 'Open menu' })
    expect(menuButton).toBeDefined()
  })

  it('should have aria-label for main navigation', () => {
    render(<Navigation />)

    const nav = screen.getByLabelText('Main navigation')
    expect(nav).toBeDefined()
  })
})

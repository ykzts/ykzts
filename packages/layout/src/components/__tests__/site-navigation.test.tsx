import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: 'light',
    setTheme: vi.fn()
  })
}))

const { default: SiteNavigation } = await import('../site-navigation')

describe('SiteNavigation', () => {
  it('renders default navigation links (About, Works, Contact)', () => {
    render(<SiteNavigation />)

    expect(screen.getAllByText('About').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Works').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Contact').length).toBeGreaterThan(0)
  })

  it('renders Blog trigger with sub-items (Archive, Search)', async () => {
    render(<SiteNavigation />)

    const blogTrigger = screen.getByRole('button', { name: /blog/i })
    expect(blogTrigger).toBeInTheDocument()

    const menuButton = screen.getByRole('button', { name: 'メニューを開く' })
    await userEvent.click(menuButton)

    expect(screen.getAllByText('Archive').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Search').length).toBeGreaterThan(0)
  })

  it('shows Works link when hasWorks is true', () => {
    render(<SiteNavigation hasWorks={true} />)

    expect(screen.getAllByText('Works').length).toBeGreaterThan(0)
  })

  it('hides Works link when hasWorks is false', () => {
    render(<SiteNavigation hasWorks={false} />)

    expect(screen.queryByText('Works')).not.toBeInTheDocument()
  })

  it('shows About link when hasAbout is true', () => {
    render(<SiteNavigation hasAbout={true} />)

    expect(screen.getAllByText('About').length).toBeGreaterThan(0)
  })

  it('hides About link when hasAbout is false', () => {
    render(<SiteNavigation hasAbout={false} />)

    expect(screen.queryByText('About')).not.toBeInTheDocument()
  })

  it('has an accessible mobile menu button', () => {
    render(<SiteNavigation />)

    const menuButton = screen.getByRole('button', { name: 'メニューを開く' })
    expect(menuButton).toBeInTheDocument()
  })

  it('has an aria-label on the main navigation', () => {
    render(<SiteNavigation />)

    const nav = screen.getByLabelText('Main navigation')
    expect(nav).toBeInTheDocument()
  })
})

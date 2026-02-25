import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Navigation from '../navigation'

describe('Navigation', () => {
  it('should render navigation links', () => {
    render(<Navigation />)

    expect(screen.getByText('Archive')).toBeDefined()
    expect(screen.getByText('Search')).toBeDefined()
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

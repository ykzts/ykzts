import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Contact from '../contact'

// Mock the intersection observer hook
vi.mock('react-intersection-observer', () => ({
  useInView: vi.fn(() => [vi.fn(), false])
}))

// Mock the ContactForm component
vi.mock('../contact-form', () => ({
  default: () => <div data-testid="contact-form">Contact Form</div>
}))

describe('Contact Component', () => {
  it('renders with id="contact"', () => {
    render(<Contact />)

    const section = document.querySelector('section')
    expect(section).toHaveAttribute('id', 'contact')
  })

  it('renders the section title', () => {
    const { container } = render(<Contact />)

    const heading = container.querySelector('h2')
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Get in touch')
  })
})

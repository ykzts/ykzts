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

// Mock getProfile from lib/supabase
vi.mock('@/lib/supabase', () => ({
  getProfile: vi.fn(async () => ({
    about: [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'About text' }]
      }
    ],
    email: 'test@example.com',
    id: 'test-id',
    name: 'テストユーザー',
    social_links: [{ url: 'https://github.com/test' }],
    tagline: 'ソフトウェア開発者',
    technologies: [{ name: 'JavaScript' }, { name: 'TypeScript' }]
  }))
}))

describe('Contact Component', () => {
  it('renders with id="contact"', async () => {
    const ContactElement = await Contact()
    render(ContactElement)

    const section = document.querySelector('section')
    expect(section).toHaveAttribute('id', 'contact')
  })

  it('renders the section title', async () => {
    const ContactElement = await Contact()
    const { container } = render(ContactElement)

    const heading = container.querySelector('h2')
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Contact')
  })
})

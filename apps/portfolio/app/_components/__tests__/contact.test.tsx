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
    email: null,
    name_en: 'Test User',
    name_ja: 'テストユーザー',
    social_links: [
      {
        icon: 'github',
        label: 'GitHub',
        url: 'https://github.com/test'
      }
    ],
    tagline_en: 'Software Developer',
    tagline_ja: 'ソフトウェア開発者',
    technologies: ['JavaScript', 'TypeScript']
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

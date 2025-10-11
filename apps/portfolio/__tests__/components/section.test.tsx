import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Section, {
  SectionContent,
  SectionHeader,
  SectionTitle
} from '../../app/_components/section'

// Mock the intersection observer hook
vi.mock('react-intersection-observer', () => ({
  useInView: vi.fn(() => [vi.fn(), false])
}))

describe('Section Components', () => {
  describe('Section', () => {
    it('renders children correctly', () => {
      render(
        <Section>
          <div>Test content</div>
        </Section>
      )

      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('applies intro class when intro prop is true', () => {
      render(
        <Section intro>
          <div>Intro section</div>
        </Section>
      )

      const section = document.querySelector('section')
      expect(section?.dataset.intro).toContain('')
    })

    it('renders with custom id when provided', () => {
      render(
        <Section id="test-section">
          <div>Section with ID</div>
        </Section>
      )

      const section = document.querySelector('section')
      expect(section).toHaveAttribute('id', 'test-section')
    })

    it('applies custom className when provided', () => {
      render(
        <Section className="custom-class">
          <div>Custom section</div>
        </Section>
      )

      const section = document.querySelector('section')
      expect(section).toHaveClass('custom-class')
    })
  })

  describe('SectionHeader', () => {
    it('renders children correctly', () => {
      render(
        <Section>
          <SectionHeader>
            <h2>Header content</h2>
          </SectionHeader>
        </Section>
      )

      expect(screen.getByText('Header content')).toBeInTheDocument()
    })
  })

  describe('SectionTitle', () => {
    it('renders as h2 by default', () => {
      render(
        <Section>
          <SectionHeader>
            <SectionTitle>Test Title</SectionTitle>
          </SectionHeader>
        </Section>
      )

      const title = screen.getByRole('heading', { level: 2 })
      expect(title).toBeInTheDocument()
      expect(title).toHaveTextContent('Test Title')
    })

    it('renders as h1 when in intro section', () => {
      render(
        <Section intro>
          <SectionHeader>
            <SectionTitle>Intro Title</SectionTitle>
          </SectionHeader>
        </Section>
      )

      const title = screen.getByRole('heading', { level: 1 })
      expect(title).toBeInTheDocument()
      expect(title).toHaveTextContent('Intro Title')
    })

    it('applies custom className when provided', () => {
      render(
        <Section>
          <SectionHeader>
            <SectionTitle className="custom-title">
              Title with class
            </SectionTitle>
          </SectionHeader>
        </Section>
      )

      const title = screen.getByRole('heading', { level: 2 })
      expect(title).toHaveClass('custom-title')
    })
  })

  describe('SectionContent', () => {
    it('renders children correctly', () => {
      render(
        <Section>
          <SectionContent>
            <p>Content text</p>
          </SectionContent>
        </Section>
      )

      expect(screen.getByText('Content text')).toBeInTheDocument()
    })

    it('applies custom className when provided', () => {
      render(
        <Section>
          <SectionContent className="custom-content">
            <p>Content with class</p>
          </SectionContent>
        </Section>
      )

      // Find the element by its content and check if it has the custom class
      const contentElement =
        screen.getByText('Content with class').parentElement
      expect(contentElement).toHaveClass('custom-content')
    })
  })
})

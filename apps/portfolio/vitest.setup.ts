import '@testing-library/jest-dom'
import React from 'react'
import { vi } from 'vitest'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams()
}))

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    ...props
  }: {
    src: string
    alt: string
    [key: string]: unknown
  }) => React.createElement('img', { alt, src, ...props })
}))

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode
    href: string
    [key: string]: unknown
  }) => React.createElement('a', { href, ...props }, children)
}))

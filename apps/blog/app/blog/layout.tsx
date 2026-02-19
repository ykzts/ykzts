import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  alternates: {
    types: {
      'application/atom+xml': '/blog/atom.xml'
    }
  }
}

type LayoutProps = {
  children: ReactNode
}

export default function BlogLayout({ children }: LayoutProps) {
  return children
}

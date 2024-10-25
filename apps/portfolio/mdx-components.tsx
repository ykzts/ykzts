import type { MDXComponents } from 'mdx/types'
import Link from './components/link'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    a: Link
  }
}

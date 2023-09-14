import { type MDXComponents } from 'mdx/types'
import Link from './components/link'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    a: ({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ref: _ref,
      ...props
    }) => <Link {...props} />
  }
}

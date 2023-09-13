import { type MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    a({ href, rel, target, ...props }) {
      const isExternal =
        !!href && (href.startsWith('https://') || href.startsWith('http://'))
      const relList = new Set(rel ? rel.split(/\s+/) : [])

      if (isExternal) {
        relList.add('noreferrer')
        relList.add('noopener')
      }

      return (
        <a
          href={href}
          rel={relList.size > 0 ? [...relList].join(' ') : undefined}
          target={target ?? isExternal ? '_blank' : undefined}
          {...props}
        />
      )
    }
  }
}

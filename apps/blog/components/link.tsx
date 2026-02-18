import NextLink from 'next/link'
import type { ComponentProps } from 'react'

export default function Link({
  children,
  href,
  rel,
  target,
  ...props
}: ComponentProps<'a'>) {
  const isExternal =
    !!href && (href.startsWith('https://') || href.startsWith('http://'))
  const relList = new Set(rel ? rel.split(/\s+/) : [])

  if (isExternal) {
    relList.add('noreferrer')
    relList.add('noopener')
  }

  if (isExternal || !href) {
    return (
      <a
        href={href}
        rel={relList.size > 0 ? [...relList].join(' ') : undefined}
        target={target ?? (isExternal ? '_blank' : undefined)}
        {...props}
      >
        {children}
      </a>
    )
  }

  return (
    <NextLink href={href} {...props}>
      {children}
    </NextLink>
  )
}

import { type AnchorHTMLAttributes, forwardRef } from 'react'

export default forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement>
>(function Link({ href, rel, target, ...props }, ref) {
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
      ref={ref}
      rel={relList.size > 0 ? [...relList].join(' ') : undefined}
      target={target ?? (isExternal ? '_blank' : undefined)}
      {...props}
    />
  )
})

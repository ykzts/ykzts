import React, { DetailedHTMLProps, FC, AnchorHTMLAttributes } from 'react'

const DEFAULT_ANCHOR_TARGET = '_blank'
const DEFAULT_LINK_TYPES = ['noopener', 'noreferrer']

type Props = DetailedHTMLProps<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
>

const ExternalLink: FC<Props> = ({ children, href, rel = '', ...props }) => {
  const linkTypes = new Set([...DEFAULT_LINK_TYPES, ...rel.split(/\s+/)])

  return (
    <a
      href={href}
      rel={[...linkTypes].join(' ')}
      target={DEFAULT_ANCHOR_TARGET}
      {...props}
    >
      {children}
    </a>
  )
}

export default ExternalLink

import React, { DetailedHTMLProps, FC, AnchorHTMLAttributes } from 'react'

type Props = DetailedHTMLProps<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
>

const ExternalLink: FC<Props> = ({ children, href, ...props }) => (
  <a href={href} rel="noopener noreferrer" target="_blank" {...props}>
    {children}
  </a>
)

export default ExternalLink

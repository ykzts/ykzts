import React, { FC } from 'react'

type Props = {
  className?: string
  href: string
}

const ExternalLink: FC<Props> = ({ children, className, href }) => (
  <a
    className={className}
    href={href}
    rel="noopenner noreferrer"
    target="_blank"
  >
    {children}
  </a>
)

export default ExternalLink

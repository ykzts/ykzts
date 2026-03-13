import type { ReactNode } from 'react'

type Props = {
  artworkCredit?: ReactNode
  copyright: ReactNode
  privacyLink: ReactNode
}

export default function FooterContent({
  artworkCredit,
  copyright,
  privacyLink
}: Props) {
  return (
    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
      <div className="flex flex-col items-center gap-1 md:items-start">
        {copyright}
        {artworkCredit}
      </div>
      {privacyLink}
    </div>
  )
}

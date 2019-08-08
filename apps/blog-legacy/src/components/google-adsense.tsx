import React, { FC, useEffect } from 'react'

interface Props {
  client: string
  slot: string
}

const GoogleAdSense: FC<Props> = ({ client, slot }) => {
  useEffect(() => {
    ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
  }, [])

  return (
    <ins
      className="adsbygoogle"
      data-ad-client={client}
      data-ad-format="auto"
      data-ad-slot={slot}
      data-full-width-responsive="true"
      style={{ display: 'block' }}
    />
  )
}

export default GoogleAdSense

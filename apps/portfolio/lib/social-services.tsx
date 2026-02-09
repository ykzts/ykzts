import type { ReactNode } from 'react'

function getSocialLogo(icon: string): ReactNode {
  return (
    <svg aria-hidden="true" className="size-5">
      <use href={`#${icon}-logo`} />
    </svg>
  )
}

export const SOCIAL_SERVICES = {
  facebook: { icon: getSocialLogo('facebook'), name: 'Facebook' },
  github: { icon: getSocialLogo('github'), name: 'GitHub' },
  mastodon: { icon: getSocialLogo('mastodon'), name: 'Mastodon' },
  threads: { icon: getSocialLogo('threads'), name: 'Threads' },
  x: { icon: getSocialLogo('x'), name: 'X' }
} as const

export interface SocialInfo {
  icon: ReactNode
  label: string
  url: string
}

export function getSocialInfo(
  url: string,
  service: string | null,
  name: string
): SocialInfo {
  if (!service || !(service in SOCIAL_SERVICES)) {
    throw new Error(`Unknown or missing social service: ${service}`)
  }

  const { icon, name: serviceName } =
    SOCIAL_SERVICES[service as keyof typeof SOCIAL_SERVICES]

  return {
    icon,
    label: `${name}の${serviceName}アカウント`,
    url
  }
}

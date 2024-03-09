'use client'

import { NextStudio } from 'next-sanity/studio'
import { type ComponentPropsWithoutRef } from 'react'
import sanityConfig from '@/sanity.config'

type Props = Omit<ComponentPropsWithoutRef<typeof NextStudio>, 'config'>

export function Studio(props: Props) {
  return <NextStudio config={sanityConfig} {...props} />
}

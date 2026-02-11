'use client'

import { LinkPlugin as LexicalLinkPlugin } from '@lexical/react/LexicalLinkPlugin'

export function LinkPlugin() {
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  return <LexicalLinkPlugin validateUrl={validateUrl} />
}

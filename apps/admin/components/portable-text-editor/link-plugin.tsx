'use client'

import { LinkPlugin as LexicalLinkPlugin } from '@lexical/react/LexicalLinkPlugin'

export function LinkPlugin() {
  const validateUrl = (url: string): boolean => {
    return URL.canParse(url)
  }

  return <LexicalLinkPlugin validateUrl={validateUrl} />
}

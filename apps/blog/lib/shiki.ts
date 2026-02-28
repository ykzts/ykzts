import type { BundledLanguage, Highlighter } from 'shiki'
import { createCssVariablesTheme, createHighlighter } from 'shiki'

let highlighterPromise: Promise<Highlighter> | null = null

const languages: BundledLanguage[] = [
  'typescript',
  'javascript',
  'tsx',
  'jsx',
  'python',
  'java',
  'go',
  'rust',
  'cpp',
  'c',
  'csharp',
  'php',
  'ruby',
  'swift',
  'kotlin',
  'bash',
  'shell',
  'sql',
  'json',
  'yaml',
  'xml',
  'html',
  'css',
  'scss',
  'markdown'
]

const cssVariablesTheme = createCssVariablesTheme()

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      langs: languages,
      themes: [cssVariablesTheme]
    })
  }
  return highlighterPromise
}

export async function highlightCode(
  code: string,
  language?: string
): Promise<string> {
  'use cache'
  const hl = await getHighlighter()

  const lang =
    language && hl.getLoadedLanguages().includes(language as BundledLanguage)
      ? (language as BundledLanguage)
      : 'plaintext'

  return hl.codeToHtml(code, {
    lang,
    theme: 'css-variables'
  })
}

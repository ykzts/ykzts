import {
  PortableText,
  type PortableTextBlockComponent,
  type PortableTextMarkComponentProps,
  type PortableTextReactComponents
} from '@portabletext/react'
import { type ComponentProps, Suspense } from 'react'
import Link from '@/components/link'
import type { PortableTextValue } from '@/lib/portable-text'
import { highlightCode } from '@/lib/shiki'

// Component to handle code block syntax highlighting
async function CodeBlockHighlighter({
  language,
  text
}: {
  language?: string
  text: string
}) {
  try {
    const html = await highlightCode(text, language)

    return (
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki generates safe HTML for syntax highlighting
      <div dangerouslySetInnerHTML={{ __html: html }} />
    )
  } catch (error) {
    // If highlighting fails, fall back to plain code block
    console.error('Failed to highlight code block:', error)
    return (
      <pre className="overflow-x-auto rounded-lg bg-muted p-4">
        <code>{text}</code>
      </pre>
    )
  }
}

// Named component for code blocks
const CodeBlockComponent: PortableTextBlockComponent = (props) => {
  // Extract text from the block's children spans
  const text = props.value.children
    .map((child) => {
      if ('text' in child) {
        return child.text
      }
      return ''
    })
    .join('')

  // Extract language if available
  const language =
    'language' in props.value && typeof props.value.language === 'string'
      ? props.value.language
      : undefined

  return (
    <Suspense
      fallback={
        <pre className="overflow-x-auto rounded-lg bg-muted p-4">
          <code>{text}</code>
        </pre>
      }
    >
      <CodeBlockHighlighter language={language} text={text} />
    </Suspense>
  )
}

const portableTextComponents = {
  block: {
    code: CodeBlockComponent
  },
  marks: {
    link({
      children,
      value
    }: PortableTextMarkComponentProps<{ _type: string; href: string }>) {
      const href = value?.href

      return <Link href={href}>{children}</Link>
    }
  },
  types: {
    table({
      value
    }: {
      value: {
        _key: string
        rows: Array<{
          _key: string
          cells: Array<{ _key: string; content: string; isHeader: boolean }>
        }>
      }
    }) {
      const hasHeader = value.rows[0]?.cells.every((cell) => cell.isHeader)
      const headerRow = hasHeader ? value.rows[0] : null
      const bodyRows = hasHeader ? value.rows.slice(1) : value.rows
      return (
        <table>
          {headerRow && (
            <thead>
              <tr>
                {headerRow.cells.map((cell) => (
                  <th key={cell._key}>{cell.content}</th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {bodyRows.map((row) => (
              <tr key={row._key}>
                {row.cells.map((cell) => (
                  <td key={cell._key}>{cell.content}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )
    }
  }
} satisfies Partial<PortableTextReactComponents>

type PortableTextProps = Omit<
  ComponentProps<typeof PortableText>,
  'components'
> & {
  value: PortableTextValue
}

export default function PortableTextBlock({
  value,
  ...props
}: PortableTextProps) {
  return (
    <PortableText
      {...props}
      components={portableTextComponents}
      value={value}
    />
  )
}

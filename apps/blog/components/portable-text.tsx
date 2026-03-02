import {
  PortableText,
  type PortableTextBlockComponent,
  type PortableTextMarkComponentProps,
  type PortableTextReactComponents
} from '@portabletext/react'
import Image from 'next/image'
import { type ComponentProps, Suspense } from 'react'
import Link from '@/components/link'
import { generateHeadingId } from '@/lib/extract-headings'
import type {
  CodeBlock,
  ImageBlock,
  PortableTextValue
} from '@/lib/portable-text'
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
      <div className="not-prose" dangerouslySetInnerHTML={{ __html: html }} />
    )
  } catch (error) {
    // If highlighting fails, fall back to plain code block
    console.error('Failed to highlight code block:', error)
    return (
      <pre className="not-prose overflow-x-auto rounded-lg bg-muted p-4">
        <code>{text}</code>
      </pre>
    )
  }
}

// Helper function to extract text from block children
function extractTextFromBlock(children: unknown): string {
  if (!Array.isArray(children)) {
    return ''
  }

  return children
    .map((child) => {
      if (typeof child === 'object' && child !== null && 'text' in child) {
        return String(child.text)
      }
      return ''
    })
    .join('')
}

// Named component for code blocks
const CodeBlockComponent: PortableTextBlockComponent = (props) => {
  // Extract text from the block's children spans
  const text = extractTextFromBlock(props.value.children)

  // Extract language if available
  const language =
    'language' in props.value && typeof props.value.language === 'string'
      ? props.value.language
      : undefined

  return (
    <Suspense
      fallback={
        <pre className="not-prose overflow-x-auto rounded-lg bg-muted p-4">
          <code>{text}</code>
        </pre>
      }
    >
      <CodeBlockHighlighter language={language} text={text} />
    </Suspense>
  )
}

// Heading components with IDs for ToC
const createHeadingComponent = (
  Tag: 'h2' | 'h3'
): PortableTextBlockComponent => {
  return (props) => {
    const text = extractTextFromBlock(props.value.children)
    const id = generateHeadingId(text)

    return (
      <Tag className="scroll-mt-20" id={id}>
        {props.children}
      </Tag>
    )
  }
}

const portableTextComponents = {
  block: {
    code: CodeBlockComponent,
    h2: createHeadingComponent('h2'),
    h3: createHeadingComponent('h3')
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
    async code({ value }: { value: CodeBlock }) {
      const { code, language } = value
      const html = await highlightCode(code, language)

      return (
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki generates safe HTML for syntax highlighting
        <div dangerouslySetInnerHTML={{ __html: html }} />
      )
    },
    image({ value }: { value: ImageBlock }) {
      const { alt, asset, height, width } = value
      const imageUrl = asset?.url

      if (!imageUrl) {
        return null
      }

      const normalizeDimension = (
        dimension: number | undefined,
        fallback: number
      ) =>
        Number.isFinite(dimension) && (dimension as number) > 0
          ? Math.round(dimension as number)
          : fallback

      const normalizedHeight = normalizeDimension(height, 900)
      const normalizedWidth = normalizeDimension(width, 1600)

      return (
        <figure className="my-8">
          <div className="w-full">
            <Image
              alt={alt || ''}
              className="h-auto w-full rounded-lg"
              height={normalizedHeight}
              sizes="(min-width: 1024px) 800px, 100vw"
              src={imageUrl}
              width={normalizedWidth}
            />
          </div>
          {alt && (
            <figcaption className="mt-2 text-center text-muted-foreground text-sm">
              {alt}
            </figcaption>
          )}
        </figure>
      )
    },
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
    <div className="prose prose-theme max-w-none prose-p:leading-relaxed prose-a:no-underline prose-a:hover:underline">
      <PortableText
        {...props}
        components={portableTextComponents}
        value={value}
      />
    </div>
  )
}

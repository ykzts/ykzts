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
      return (
        <div className="not-prose my-6 overflow-x-auto">
          <table className="w-full border-collapse border border-border text-sm">
            <tbody>
              {value.rows.map((row) => (
                <tr key={row._key}>
                  {row.cells.map((cell) =>
                    cell.isHeader ? (
                      <th
                        className="border border-border bg-muted/50 px-4 py-2 text-left font-semibold"
                        key={cell._key}
                      >
                        {cell.content}
                      </th>
                    ) : (
                      <td
                        className="border border-border px-4 py-2"
                        key={cell._key}
                      >
                        {cell.content}
                      </td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    <div className="prose max-w-none prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-a:text-primary prose-bullets:text-foreground prose-code:text-foreground prose-code:text-sm prose-counters:text-foreground prose-headings:text-foreground prose-lead:text-foreground prose-quotes:text-foreground prose-strong:text-foreground text-foreground prose-p:leading-relaxed prose-a:no-underline prose-code:before:content-none prose-code:after:content-none prose-a:hover:underline">
      <PortableText
        {...props}
        components={portableTextComponents}
        value={value}
      />
    </div>
  )
}

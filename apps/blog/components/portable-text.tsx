import {
  PortableText,
  type PortableTextBlockComponent,
  type PortableTextMarkComponentProps,
  type PortableTextReactComponents
} from '@portabletext/react'
import Image from 'next/image'
import type React from 'react'
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
        <pre className="overflow-x-auto rounded-lg bg-muted p-4">
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
    code({ children }: { children: React.ReactNode }) {
      return (
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
          {children}
        </code>
      )
    },
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
      const { alt, asset } = value
      const imageUrl = asset?.url

      if (!imageUrl) {
        return null
      }

      return (
        <figure className="my-8">
          <div className="relative aspect-[4/3] w-full">
            <Image
              alt={alt || ''}
              className="rounded-lg object-contain"
              fill
              sizes="(min-width: 1024px) 800px, 100vw"
              src={imageUrl}
            />
          </div>
          {alt && (
            <figcaption className="mt-2 text-center text-muted-foreground text-sm">
              {alt}
            </figcaption>
          )}
        </figure>
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
    <div className="prose max-w-none prose-a:text-primary prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-p:leading-relaxed prose-a:no-underline prose-a:hover:underline">
      <PortableText
        {...props}
        components={portableTextComponents}
        value={value}
      />
    </div>
  )
}

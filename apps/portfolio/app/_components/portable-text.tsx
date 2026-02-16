import {
  PortableText,
  type PortableTextBlockComponent,
  type PortableTextMarkComponentProps,
  type PortableTextReactComponents
} from '@portabletext/react'
import type React from 'react'
import { type ComponentProps, Suspense, use } from 'react'
import Link from '@/components/link'
import type { PortableTextValue } from '@/lib/portable-text'
import { highlightCode } from '@/lib/shiki'

// Helper function to extract text content from React children
function extractTextFromChildren(children: React.ReactNode): string {
  if (typeof children === 'string') {
    return children
  }
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('')
  }
  if (children && typeof children === 'object' && 'props' in children) {
    const childProps = children.props as { children?: React.ReactNode }
    return extractTextFromChildren(childProps.children)
  }
  return ''
}

// Component to handle code block syntax highlighting
function CodeBlockHighlighter({ children }: { children: React.ReactNode }) {
  const text = extractTextFromChildren(children)
  const htmlPromise = highlightCode(text)

  try {
    const html = use(htmlPromise)

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
const CodeBlockComponent: PortableTextBlockComponent = (props) => (
  <Suspense
    fallback={
      <pre className="overflow-x-auto rounded-lg bg-muted p-4">
        <code>{extractTextFromChildren(props.children)}</code>
      </pre>
    }
  >
    <CodeBlockHighlighter>{props.children}</CodeBlockHighlighter>
  </Suspense>
)

const portableTextComponents = {
  block: {
    code: CodeBlockComponent
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

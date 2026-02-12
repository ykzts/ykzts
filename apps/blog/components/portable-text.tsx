import {
  PortableText,
  type PortableTextMarkComponentProps,
  type PortableTextReactComponents
} from '@portabletext/react'
import Link from 'next/link'
import type { ComponentProps } from 'react'
import type { CodeBlock, PortableTextValue } from '@/lib/portable-text'
import { highlightCode } from '@/lib/shiki'

const portableTextComponents = {
  marks: {
    link({
      children,
      value
    }: PortableTextMarkComponentProps<{ _type: string; href: string }>) {
      const href = value?.href

      if (!href) {
        return <>{children}</>
      }

      const isExternal =
        href.startsWith('http://') || href.startsWith('https://')

      if (isExternal) {
        return (
          <a href={href} rel="noopener noreferrer" target="_blank">
            {children}
          </a>
        )
      }

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
    <div className="prose prose-lg max-w-none prose-a:text-primary prose-headings:text-foreground prose-p:text-base prose-p:text-muted-foreground prose-strong:text-foreground prose-p:leading-relaxed prose-a:no-underline prose-a:hover:underline">
      <PortableText
        {...props}
        components={portableTextComponents}
        value={value}
      />
    </div>
  )
}
